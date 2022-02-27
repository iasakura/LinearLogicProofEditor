import { Formula, Sequent } from './Formula';
import * as UUID from 'uuid';

export const checkAxiomRule = (s: Sequent): boolean => {
  if (s.length !== 2) {
    return false;
  }

  let [a, b] = s;

  // ~a, a
  if (b.name === 'var' && a.name === 'unary' && a.op === 'not') {
    [a, b] = [b, a];
  }

  // a, ~a
  if (!(a.name === 'var' && b.name === 'unary' && b.op === 'not')) {
    return false;
  }

  b = b.children[0];
  if (b.name === 'var' && b.var === a.var) {
    return true;
  } else {
    return false;
  }
};

const splitAt = (
  s: Sequent,
  pos: number
): [Sequent, Formula, Sequent] | undefined => {
  if (s.length <= pos) {
    return undefined;
  }

  return [s.slice(0, pos), s[pos], s.slice(pos + 1)];
};

const childOfBin = (op: string, f: Formula): [Formula, Formula] | undefined => {
  if (f.name === 'binary' && f.op === op) {
    return f.children;
  } else {
    return undefined;
  }
};

const childOfUnary = (op: string, f: Formula): [Formula] | undefined => {
  if (f.name === 'unary' && f.op === op) {
    return f.children;
  } else {
    return undefined;
  }
};

const escape = (): never => {
  throw new Error('escape');
};

const catchEscape = (e: unknown): undefined => {
  if (e instanceof Error && e.message === 'escape') {
    return undefined;
  } else {
    throw e;
  }
};

const computeNot = (f: Formula): Formula => {
  if (f.name === 'var') {
    return {
      name: 'unary',
      op: 'not',
      children: [f],
      key: UUID.v4(),
    };
  } else if (f.name === 'unary') {
    if (f.op === 'not') {
      return f.children[0];
    } else if (f.op === 'ofCourse') {
      return {
        name: 'unary',
        op: 'whyNot',
        children: [computeNot(f.children[0])],
        key: UUID.v4(),
      };
    } else if (f.op === 'whyNot') {
      return {
        name: 'unary',
        op: 'ofCourse',
        children: [computeNot(f.children[0])],
        key: UUID.v4(),
      };
    } else {
      // never
      return f.op;
    }
  } else if (f.name === 'binary') {
    if (f.op === 'and') {
      return {
        name: 'binary',
        op: 'or',
        children: [computeNot(f.children[0]), computeNot(f.children[1])],
        key: UUID.v4(),
      };
    } else if (f.op === 'or') {
      return {
        name: 'binary',
        op: 'and',
        children: [computeNot(f.children[0]), computeNot(f.children[1])],
        key: UUID.v4(),
      };
    } else if (f.op === 'tensor') {
      return {
        name: 'binary',
        op: 'par',
        children: [computeNot(f.children[0]), computeNot(f.children[1])],
        key: UUID.v4(),
      };
    } else if (f.op === 'par') {
      return {
        name: 'binary',
        op: 'tensor',
        children: [computeNot(f.children[0]), computeNot(f.children[1])],
        key: UUID.v4(),
      };
    } else {
      // never
      return f.op;
    }
  } else {
    // never
    return f;
  }
};

export const applyCutRule = (
  s: Sequent,
  pos: number,
  c: Formula
): Sequent[] | undefined => {
  try {
    const left = s.slice(0, pos);
    const right = s.slice(pos + 1);
    const not_c = computeNot(c);

    return [left.concat(c), [not_c].concat(right)];
  } catch (e) {
    return catchEscape(e);
  }
};

export const applyParRule = (
  s: Sequent,
  pos: number
): Sequent[] | undefined => {
  try {
    const [left, f, right] = splitAt(s, pos) || escape();
    const [a, b] = childOfBin('par', f) || escape();

    return [left.concat(a, b, ...right)];
  } catch (e) {
    return catchEscape(e);
  }
};

export const applyTensorRule = (
  s: Sequent,
  pos: number
): Sequent[] | undefined => {
  try {
    const [left, f, right] = splitAt(s, pos) || escape();
    const [a, b] = childOfBin('tensor', f) || escape();

    return [left.concat(a), [b].concat(right)];
  } catch (e) {
    return catchEscape(e);
  }
};

export const applyAndRule = (
  s: Sequent,
  pos: number
): Sequent[] | undefined => {
  try {
    const [left, f, right] = splitAt(s, pos) || escape();
    const [a, b] = childOfBin('and', f) || escape();

    return [left.concat(a, ...right), left.concat(b, ...right)];
  } catch (e) {
    return catchEscape(e);
  }
};

export const applyOr1Rule = (
  s: Sequent,
  pos: number
): Sequent[] | undefined => {
  try {
    const [left, f, right] = splitAt(s, pos) || escape();
    const [a, b] = childOfBin('or', f) || escape();

    return [left.concat(a, ...right)];
  } catch (e) {
    return catchEscape(e);
  }
};

export const applyOr2Rule = (
  s: Sequent,
  pos: number
): Sequent[] | undefined => {
  try {
    const [left, f, right] = splitAt(s, pos) || escape();
    const [a, b] = childOfBin('or', f) || escape();

    return [left.concat(a, ...right)];
  } catch (e) {
    return catchEscape(e);
  }
};

export const applyOfCourseRule = (
  s: Sequent,
  pos: number
): Sequent[] | undefined => {
  try {
    const [left, f, right] = splitAt(s, pos) || escape();
    const [a] = childOfUnary('ofCourse', f) || escape();

    if (
      !(
        left.every((b) => b.name === 'unary' && b.op == 'whyNot') &&
        right.every((b) => b.name === 'unary' && b.op == 'whyNot')
      )
    ) {
      return undefined;
    }

    return [left.concat(a, ...right)];
  } catch (e) {
    return catchEscape(e);
  }
};

export const applyDerelictionRule = (
  s: Sequent,
  pos: number
): Sequent[] | undefined => {
  try {
    const [left, f, right] = splitAt(s, pos) || escape();
    const [a] = childOfUnary('whyNot', f) || escape();

    return [left.concat(a, ...right)];
  } catch (e) {
    return catchEscape(e);
  }
};

export const applyContractionRule = (
  s: Sequent,
  pos: number
): Sequent[] | undefined => {
  try {
    const [left, f, right] = splitAt(s, pos) || escape();
    childOfUnary('whyNot', f) || escape();

    return [left.concat(f, f, ...right)];
  } catch (e) {
    return catchEscape(e);
  }
};

export const applyWeakeningRule = (
  s: Sequent,
  pos: number
): Sequent[] | undefined => {
  try {
    const [left, f, right] = splitAt(s, pos) || escape();
    childOfUnary('whyNot', f) || escape();

    return [left.concat(...right)];
  } catch (e) {
    return catchEscape(e);
  }
};
