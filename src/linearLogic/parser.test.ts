import { parse } from './parser';

test('complex', () => {
  const input = '!(A*B)&C|D';
  const ret = parse(input);
  expect(ret).toMatchSnapshot();
});
