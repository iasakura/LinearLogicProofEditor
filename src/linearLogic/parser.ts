import * as parser from '../../gen/parser';
import { Formula } from './Formula';

export const parse = (formula: string): Formula => {
  return parser.parse(formula) as Formula;
};
