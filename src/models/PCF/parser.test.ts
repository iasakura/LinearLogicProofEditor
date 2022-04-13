import { parseTerm } from './parser';

test('complex', () => {
  const input = 'lam f: nat -> nat-> nat. lam x: nat. f (f (f x))';
  const ret = parseTerm(input);
  expect(ret).toMatchSnapshot();
});
