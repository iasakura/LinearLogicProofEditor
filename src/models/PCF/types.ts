export type Var = string;

export type Typ =
  | { name: 'bool' }
  | { name: 'nat' }
  | { name: 'arrow'; types: [Typ, Typ] };

export type primitives = 'succ' | 'pred' | 'iszero' | 'cond' | 'Y';

export type Term =
  | { name: 'var'; v: Var }
  | { name: 'nat-const'; val: number }
  | { name: 'bool-const'; val: boolean }
  | { name: 'app'; terms: [Term, Term] }
  | { name: 'lambda'; v: string; typ: Typ; body: Term }
  | { name: 'prim'; v: primitives };

export type Context = [Var, Typ][];
