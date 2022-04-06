{{
  import { Formula } from '../models/linearLogic/Formula';

  const opToName = (op: string) => {
    if (op == '|') { return 'or'; }
    if (op == '@') { return 'par'; }
    if (op == '*') { return 'tensor'; }
    if (op == '&') { return 'and'; }
    if (op == '~') { return 'not'; }
    if (op == '!') { return 'ofCourse'; }
    if (op == '?') { return 'whyNot'; }
  }
}}

Formula
  = f1:Formula1 fs:(_ op:("|" / "@") _ f2:Formula1)* {
      return fs.reduce((formula: Formula, arg: [string, string, string, Formula]) => {
        const [_1, op, _2, f] = arg;
        return { name: 'binary', op: opToName(op), children: [formula, f] };
      }, f1);
    }

Formula1
  = f1:Formula2 fs:(_ op:("&" / "*") _ f2:Formula2)* {
    return fs.reduce((formula: Formula, arg: [string, string, string, Formula]) => {
        const [_1, op, _2, f] = arg;
        return { name: 'binary', op: opToName(op), children: [formula, f] };
      }, f1);
    }

Formula2
  = op:("~" / "!" / "?") _ f:Formula2 {
    return { name: 'unary', op: opToName(op), children: [f] };
  } /
  f:Formula3 {
    return f;
  }

Formula3
  = v:([a-zA-Z] [a-zA-Z0-9]*) {
    return {name: 'var', var: v[0] + v[1].join() };
  } / "(" _ f:Formula _ ")" {
    return f;
  }

_ "whitespace"
  = [ \t\n\r]*
