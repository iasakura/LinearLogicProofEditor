import { parseFormula } from './parser';

test('complex', () => {
  const input = '!(A*B)&C|D';
  const ret = parseFormula(input);
  expect(ret).toMatchSnapshot();
});
