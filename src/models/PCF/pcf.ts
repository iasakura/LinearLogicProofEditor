export type Typ =
  | { name: 'bool' }
  | { name: 'nat' }
  | { name: 'arrow'; types: [Typ, Typ] };

export type primitives = 'succ' | 'pred' | 'iszero' | 'cond' | 'Y';

export type Term =
  | { name: 'var'; var: string; type: Typ }
  | { name: 'nat-const'; type: number }
  | { name: 'bool-const'; type: boolean }
  | { name: 'app'; terms: [Term, Term] }
  | { name: 'lambda'; var: string; type: Typ; body: [Term] }
  | { name: 'prem'; var: primitives };
