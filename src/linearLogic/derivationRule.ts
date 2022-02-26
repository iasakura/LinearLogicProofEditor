import { Formula, Sequent } from './Formula';

export const checkAxiomRule = (s: Sequent): boolean => {
  if (s.length !== 2) {
    return false;
  }

  let [a, b] = s;

  if (b.name === 'var' && a.name === 'unary' && a.op === 'not') {
    [a, b] = [b, a];
  }

  if (!(a.name === 'unary' && a.op === 'not' && b.name === 'var')) {
    return false;
  }

  a = a.children[0];
  if (a.name === 'var' && a.var === b.var) {
    return true;
  } else {
    return false;
  }
};

export const applyParRule = (
  s1: Sequent,
  a1: Formula,
  a2: Formula,
  s2: Sequent
): Sequent => {
  return s1.concat(a1, a2, ...s2);
};

export const applyTensorRule = (
  s1: Sequent,
  a1: Formula,
  a2: Formula,
  s2: Sequent
): [Sequent, Sequent] => {
  return [s1.concat(a1), [a2].concat(...s2)];
};

export const applyAndRule = (
  s1: Sequent,
  a1: Formula,
  a2: Formula,
  s2: Sequent
): [Sequent, Sequent] => {
  return [s1.concat(a1, ...s2), s1.concat([a2], ...s2)];
};

export const applyOrRule = (s1: Sequent, a1: Formula, s2: Sequent): Sequent => {
  return s1.concat(a1, ...s2);
};

export const applyOfCourseRule = (
  s1: Sequent,
  a: Formula,
  s2: Sequent
): Sequent | undefined => {
  if (
    !(
      s1.every((b) => b.name === 'unary' && b.op == 'whyNot') &&
      s2.every((b) => b.name === 'unary' && b.op == 'whyNot')
    )
  ) {
    return undefined;
  }
  return s1.concat(a, ...s2);
};

export const applyDerelictionRule = (
  s1: Sequent,
  a: Formula,
  s2: Sequent
): Sequent | undefined => {
  return s1.concat(a, ...s2);
};

export const applyContractionRule = (
  s1: Sequent,
  a: Formula,
  s2: Sequent
): Sequent | undefined => {
  return s1.concat(a, a, ...s2);
};

export const applyWeakeningRule = (
  s1: Sequent,
  _a: Formula,
  s2: Sequent
): Sequent | undefined => {
  return s1.concat(...s2);
};
