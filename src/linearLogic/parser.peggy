{{
  const opToName = (op) => {
    if (op == '|') { return 'or'; }
    if (op == '@') { return 'par'; }
    if (op == '*') { return 'tensor'; }
    if (op == '&') { return 'and'; }
    if (op == '~') { return 'not'; }
    if (op == '!') { return 'ofCourse'; }
    if (op == '?') { return 'whiNot'; }
  }
}}

Formula
  = f1:Formula1 _ op:("|" / "@") _ f2:Formula {
      return { name: 'binary', op: opToName(op), children: [f1, f2] };
    } /
    f: Formula1 {
      return f;
    }

Formula1
  = f1:Formula2 _ op:("*" / "&") _ f2:Formula1 {
      return { name: 'binary', op: opToName(op), children: [f1, f2] };
    } /
    f: Formula2 {
      return f;
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
