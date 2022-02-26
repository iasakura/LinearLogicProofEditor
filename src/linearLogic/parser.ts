import * as parser from '../gen/parser';
import { Formula } from './Formula';

export const parseFormula = (formula: string): Formula => {
  return parser.parse(formula) as Formula;
};

export const parseSequent = (sequent: string): Formula[] => {
  return sequent
    .split(',')
    .map((s) => s.trim())
    .map((s) => parser.parse(s) as Formula);
};
