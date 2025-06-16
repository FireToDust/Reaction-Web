// Note: You can import your separate WGSL shader files like this.
import { GameData } from './core/types';
import * as Renderer from './graphics/renderer'
import setup from './core/setup'
import { Pane } from 'tweakpane';
import { Reaction, Rules, and, or, not, tileAt, Tile, Dir} from './rules/rules';
import { randomChoice } from './utils/util';

let gameData: GameData = {
  time: 0,
  rules: undefined,
  map: undefined,
  mapW: 2**8,
  mapH: 2**8,
  cameraX: 2**7,
  cameraY: 2**7,
  zoomX: 30,
  zoomY: 30
}
document.addEventListener("keydown", (e) => {
    const speed = 0.01;
    if (e.key === "ArrowUp") gameData.cameraY += speed/gameData.zoomY;
    if (e.key === "ArrowDown") gameData.cameraY -= speed/gameData.zoomY;
    if (e.key === "ArrowLeft") gameData.cameraX -= speed/gameData.zoomX;
    if (e.key === "ArrowRight") gameData.cameraX += speed/gameData.zoomX;
});

document.addEventListener("wheel", (e) => {
    gameData.zoomX *= e.deltaY > 0 ? 1.1 : 0.9;
    gameData.zoomY *= e.deltaY > 0 ? 1.1 : 0.9; // Zoom in/out
});

export default async function init(): Promise<void> {

  let updatePeriod = 0.1;

  const mapData = new Uint32Array(gameData.mapW * gameData.mapH); // Fill with tile types
  
  let chances = Array(100).fill(Tile.GRASS).concat([Tile.WATER, 20, 20, 20])

  for (let i = 0; i < mapData.length; i++) {
    mapData[i] = randomChoice(chances); // Math.random() gives a value between 0 and 1
  } 
  const startTime = performance.now(); 
  gameData.map = mapData
  // Tweakpane: easily adding tweak control for parameters.

  let rules = new Rules()

  // Conditions

  let closeToWater = tileAt(Tile.WATER, Dir.N, 1)
  let kindaCloseToWater = or ( 
    tileAt(Tile.WATER, Dir.NE, 1), 
    tileAt(Tile.WATER, Dir.N, 1), 
    tileAt(Tile.WATER, Dir.N, 2))
  let waterFlow = and(
    tileAt(Tile.WATER, Dir.N, 1), 
    tileAt(Tile.WATER, Dir.N, 2), 
    not(or(tileAt(Tile.WATER, Dir.NW, 1), tileAt(Tile.WATER, Dir.NE, 1))))
  let waterPool = and(
    or (tileAt(Tile.WATER, Dir.N, 1), tileAt(Tile.WATER, Dir.N, 2)), 
    or (tileAt(Tile.WATER, Dir.E, 1), tileAt(Tile.WATER, Dir.E, 2)), 
    or (tileAt(Tile.WATER, Dir.S, 1), tileAt(Tile.WATER, Dir.S, 2)))
  let suroundedByWater = or(
    and(
      or (tileAt(Tile.WATER, Dir.N, 1), tileAt(Tile.WATER, Dir.N, 2)), 
      or (tileAt(Tile.WATER, Dir.S, 1), tileAt(Tile.WATER, Dir.S, 2))), 
    and(tileAt(Tile.WATER, Dir.NE, 1), tileAt(Tile.WATER, Dir.SW, 1)))
  let enoughWater = and(
    tileAt(Tile.WATER, Dir.N, 1), 
    tileAt(Tile.WATER, Dir.E, 1), 
    tileAt(Tile.WATER, Dir.NE, 1), 
    or(tileAt(Tile.WATER, Dir.NW, 1), tileAt(Tile.WATER, Dir.SE, 1)))

  let closeToMud = tileAt(Tile.MUD, Dir.N, 1)
  let lotsOfMud = and(
    tileAt(Tile.GRASS, Dir.NE, 1), 
    tileAt(Tile.GRASS, Dir.E, 1), 
    tileAt(Tile.GRASS, Dir.NW, 1))
  

  let closeToSand = tileAt(20, Dir.N, 1)

  let closeToSomeSand = and(
    tileAt(20, Dir.N, 1), 
    or (
      tileAt(20, Dir.E, 1), 
      tileAt(20, Dir.S, 1), 
      tileAt(20, Dir.NE, 1)))

  let suroundedBySand = and(
    or (tileAt(20, Dir.N, 1), tileAt(20, Dir.N, 2)), 
    tileAt(20, Dir.S, 1))

  let lotsOfGrass = and(tileAt(Tile.GRASS, Dir.N, 1), tileAt(Tile.GRASS, Dir.S, 1))

  // Reactions

  let dirtToMud = new Reaction(Tile.MUD, -3)
  //dirtToMud.add_condition(kindaCloseToWater, 2)
  //dirtToMud.add_condition(closeToMud, 2)
  dirtToMud.add_condition(closeToWater, 4)

  let mudToWater = new Reaction(Tile.WATER, -6)
  mudToWater.add_condition(waterFlow, 2)
  mudToWater.add_condition(suroundedByWater, 2)
  mudToWater.add_condition(closeToWater, 5)
  mudToWater.add_condition(closeToSand, 2)

  let waterToSand = new Reaction(20, -1)
  waterToSand.add_condition(waterFlow, -2)
  waterToSand.add_condition(waterPool, -2)
  waterToSand.add_condition(enoughWater, -2)
  waterToSand.add_condition(suroundedByWater, -2)
  waterToSand.add_condition(closeToMud, -2)

  let waterToMud = new Reaction(Tile.MUD, 0)
  waterToMud.add_condition(waterFlow, -2)
  waterToMud.add_condition(waterPool, -2)
  waterToMud.add_condition(enoughWater, -2)
  waterToMud.add_condition(suroundedByWater, -2)
  //waterToMud.add_condition(closeToSand, -2))

  let mudToGrass = new Reaction(Tile.GRASS, 2)
  mudToGrass.add_condition(kindaCloseToWater, -1)
  mudToGrass.add_condition(closeToWater, -2)
  mudToGrass.add_condition(closeToMud, -1)

  let sandToWater = new Reaction(Tile.WATER, -1)
  sandToWater.add_condition(suroundedByWater, 2)

  let sandToGrass = new Reaction(Tile.GRASS, -2)
  sandToGrass.add_condition(lotsOfGrass, 3)

  let dirtToSand = new Reaction(20, -3)
  //dirtToSand.add_condition(kindaCloseToWater, 4)
  //dirtToSand.add_condition(closeToSand, 3)
  //dirtToSand.add_condition(suroundedBySand, 3))
  //dirtToSand.add_condition(lotsOfGrass, -4)

  let lavaRow = and(and(tileAt(Tile.LAVA, Dir.NW, 1), tileAt(Tile.LAVA, Dir.NE, 1)), tileAt(Tile.LAVA, Dir.N, 1))

  let dirtToLava = new Reaction(Tile.LAVA, -1)
  dirtToLava.add_condition(lavaRow, 2)



  rules.add_reaction(Tile.GRASS, dirtToMud)
  rules.add_reaction(Tile.GRASS, dirtToLava)
  rules.add_reaction(Tile.GRASS, dirtToSand)
  rules.add_reaction(Tile.MUD, mudToWater)
  rules.add_reaction(Tile.MUD, mudToGrass)
  rules.add_reaction(Tile.WATER, waterToSand)
  rules.add_reaction(Tile.WATER, waterToMud)
  rules.add_reaction(20, sandToWater)
  rules.add_reaction(20, sandToGrass)


  gameData.rules = rules.getData()
  const pane = new Pane({
    title: 'Debug',
    expanded: false,
  });

  pane.addInput(gameData, 'cameraX');
  pane.addInput(gameData, 'cameraY');
  pane.addInput(gameData, 'zoomX');
  pane.addInput(gameData, 'zoomY');


  let {device, context} = await setup();

  let {renderFunctions, buffers} = await Renderer.init(device, context, gameData)
  let render = await renderFunctions.render
  let react = await renderFunctions.react
  var lastUpdateTime = (performance.now() - startTime)/1000

  async function frame() {
    let commandEncoder = device.createCommandEncoder()
    gameData.time = (performance.now() - startTime)/1000
    
    await Renderer.updateBuffers(device, buffers, gameData)
    if (gameData.time - lastUpdateTime >= updatePeriod){
      console.log("Reaction Trigger")
      lastUpdateTime = (performance.now() - startTime)/1000
      await react(commandEncoder) 
    }
   
    render(commandEncoder)
    device.queue.submit([commandEncoder.finish()])
    requestAnimationFrame(frame);
  }
  

  requestAnimationFrame(frame);
}
