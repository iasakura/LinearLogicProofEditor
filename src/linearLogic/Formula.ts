export type Formula = (
  | { name: 'var'; var: string }
  | { name: 'unary'; op: 'not' | 'ofCourse' | 'whyNot'; children: [Formula] }
  | {
      name: 'binary';
      op: 'and' | 'or' | 'par' | 'tensor';
      children: [Formula, Formula];
    }
) & { key: string };

export type Sequent = Formula[];

export type OpName =
  | 'not'
  | 'ofCourse'
  | 'whyNot'
  | 'and'
  | 'or'
  | 'par'
  | 'tensor';

const opPrecedence = (op: OpName): number => {
  if (op == 'or' || op == 'par') {
    return 0;
  } else if (op == 'and' || op == 'tensor') {
    return 1;
  } else if (op == 'not' || op == 'ofCourse' || op == 'whyNot') {
    return 2;
  } else {
    // never
    return op;
  }
};

export const opToString = (op: OpName) => {
  if (op == 'not') {
    return '￢';
  } else if (op == 'ofCourse') {
    return '!';
  } else if (op == 'whyNot') {
    return '?';
  } else if (op == 'and') {
    return '&';
  } else if (op == 'or') {
    return '⊕';
  } else if (op == 'par') {
    return '⅋';
  } else if (op == 'tensor') {
    return '⊗';
  } else {
    // never
    return op;
  }
};

export const formulaToString = (f: Formula): string => {
  if (f.name == 'var') {
    return f.var;
  } else if (f.name == 'unary') {
    const [child] = f.children;
    const childStr = formulaToString(child);
    if (child.name == 'var' || opPrecedence(child.op) >= opPrecedence(f.op)) {
      return opToString(f.op) + childStr;
    } else {
      return opToString(f.op) + '(' + childStr + ')';
    }
  } else if (f.name == 'binary') {
    const children = f.children.map((child, idx) => {
      const childStr = formulaToString(child);
      if (
        child.name == 'var' ||
        (idx == 0 && opPrecedence(child.op) >= opPrecedence(f.op)) ||
        (idx == 1 && opPrecedence(child.op) > opPrecedence(f.op))
      ) {
        return childStr;
      } else {
        return '(' + childStr + ')';
      }
    });
    return children[0] + opToString(f.op) + children[1];
  } else {
    // never
    return f;
  }
};
