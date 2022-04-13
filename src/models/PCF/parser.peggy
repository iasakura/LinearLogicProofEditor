{{
  import {Typ, Term} from '../models/PCF/types';
}}

Lam
  = "lam" _ v:Var _ ':' _ t:Type _ "." _ b:Lam {
      return { name: 'lambda', v: v, typ: t, body: b }
    } / c:Cond {
      return c;
    }

Cond
  = "if" _ c:App _ "then" _ th:App _ "else" _ el:App {
      return {name: 'app', terms: [{name: 'app', terms: [{name: 'app', terms: [{ name: "prim", v: 'cond' }, c]}, th]}, el]}
  } / a:App {
      return a;
  }

App
  = f:Prim args:(_ x:Prim)+ {
      return args.reduce((acc: Term, x: [string, Term]) => {
        return { name: 'app', terms: [acc, x[1]]}
      }, f);
  } / p:Prim {
      return p;
  }

Prim
   = v:Var {
       return {name: 'var', v: v }
   } / p:("succ" / "pred" / "iszero") {
       return {name: 'prim', v: p }
   } / n:Num {
       return {name: 'nat-const', val: n }
   } / b:Bool {
       return {name: 'bool-const', val: b }
   } / "(" _ e:Lam _ ")" {
       return e;
   }

Type
   = t1:InnerType ts:(_ "->" _ t2:InnerType)* {
       return [...ts.map((x: [string, string, string, Typ]) => x[3]).reverse(), t1].reduce((ty, t) => {
           return { name: 'arrow', types: [t, ty]}
       })
   } / InnerType

InnerType
    = 'nat' {
       return { name: 'nat' }
     } / 'bool' {
         return { name: 'bool' }
     } / "(" t:Type ")" {
         return t;
     }

Var
    = !Keywords v:Lit {
        return v;
    }

Lit
    = h:[a-zA-Z] t:[a-zA-Z0-9]* {
        return [h, ...t].join('');
}

Num
    = n:([0-9]+) {
        return parseInt(n, 10);
    }

Bool
    = b:("true" / "false") {
        return b === 'true';
    }

Keywords = "lam"/"if"/"then"/"else"/"iszero"/"succ"/"pred"

 _ "whitespace"
  = [ \t\n\r]*
