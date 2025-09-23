export interface RuleCondition {
  type: 'tile_type';
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not_in';
  value: number | number[] | string;
  position?: RelativePosition;
  layer?: LayerType;
}

export interface IRuleCompiler {
  compileRule(rule: ReactionRule): Promise<CompiledRule>;
  compileRuleSet(rules: ReactionRule[]): Promise<CompiledRuleSet>;
  optimizeRuleSet(ruleSet: CompiledRuleSet): CompiledRuleSet;
  generateShaderCode(ruleSet: CompiledRuleSet): string;
}


export interface OptimizationInfo {
    rulesOptimized: number;
    conditionsReduced: number;
    duplicatesRemoved: number;
    compilationTimeMs: number;
  }