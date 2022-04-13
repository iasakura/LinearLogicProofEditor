import * as parser from '../../gen/pcf-parser';
import { Term } from './types';

export const parseTerm = (formula: string): Term => {
  return parser.parse(formula) as Term;
};
