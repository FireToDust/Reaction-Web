// Lets wgsl files be imported as text.

declare module '*.wgsl' {
  const shader: string;
  export default shader;
}