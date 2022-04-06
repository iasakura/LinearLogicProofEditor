import assert from 'assert';
import * as pn from '../ProofNet/proof-net';

export type Var = string;

export type Typ =
  | { name: 'bool' }
  | { name: 'nat' }
  | { name: 'arrow'; types: [Typ, Typ] };

export type primitives = 'succ' | 'pred' | 'iszero' | 'cond' | 'Y';

export type Term =
  | { name: 'var'; v: Var }
  | { name: 'nat-const'; val: number }
  | { name: 'bool-const'; val: boolean }
  | { name: 'app'; terms: [Term, Term] }
  | { name: 'lambda'; v: string; typ: Typ; body: Term }
  | { name: 'prim'; v: primitives };

export type Context = [Var, Typ][];

const conclOfPn = (pn: pn.ProofStructure) => {
  return pn.concls[pn.concls.length - 1];
};

const premsOfPn = (pn: pn.ProofStructure) => {
  return pn.concls.slice(0, pn.concls.length - 1);
};

export const termToPN = (
  ctx: Context,
  term: Term
): pn.ProofStructure & { ctxMap: Var[] } => {
  if (term.name === 'var') {
    const ax = pn.Ax();
    const der = pn.Dereliction(ax.concls()[0]);
    return {
      concls: [...der.concls(), ax.concls()[1]],
      boxes: [],
      ctxMap: [term.v],
    };
  } else if (term.name === 'nat-const' || term.name === 'bool-const') {
    const constant = pn.Constant(term.val);
    const ofCourse = pn.OfCourse(constant.concls()[0]);
    const box: pn.Box = { principle: ofCourse, auxiliaries: [] };
    return { concls: ofCourse.concls(), boxes: [box], ctxMap: [] };
  } else if (term.name === 'app') {
    const [func, arg] = term.terms;
    const f_pn = termToPN(ctx, func);
    const arg_pn = termToPN(ctx, arg);

    const ax = pn.Ax();
    const tensor = pn.Tensor(conclOfPn(arg_pn), ax.concls()[0]);
    const der = pn.Dereliction(tensor.concls()[0]);
    const _cut = pn.Cut(conclOfPn(f_pn), der.concls()[0]);

    const ctx_concls: pn.Edge[] = [];
    f_pn.ctxMap.forEach((v, i) => {
      const arg_idx = arg_pn.ctxMap.findIndex((arg_v) => v === arg_v);
      if (arg_idx === -1) {
        ctx_concls.push(f_pn.concls[i]);
      } else {
        const contraction = pn.Contraction(f_pn.concls[i], arg_pn.concls[i]);
        ctx_concls.push(contraction.concls()[0]);
      }
    });
    const ctxMap = f_pn.ctxMap;
    arg_pn.ctxMap.forEach((v, i) => {
      const f_idx = f_pn.ctxMap.findIndex((f_v) => v === f_v);
      // Only add when it appers only in arg
      if (f_idx === -1) {
        ctxMap.push(arg_pn.ctxMap[i]);
        ctx_concls.push(arg_pn.concls[i]);
      }
    });

    return {
      concls: [...ctx_concls, ax.concls()[1]],
      boxes: [...f_pn.boxes, ...arg_pn.boxes],
      ctxMap,
    };
  } else if (term.name === 'lambda') {
    const body_pn = termToPN([...ctx, [term.v, term.typ]], term.body);
    const argIdx = body_pn.ctxMap.findIndex((v) => v === term.v);
    const arg_concl =
      argIdx === -1 ? pn.Weakening().concls()[0] : body_pn.concls[argIdx];
    const par = pn.Par(arg_concl, conclOfPn(body_pn));
    const ofCourse = pn.OfCourse(par.concls()[0]);

    const auxiliaries =
      argIdx === -1 ? premsOfPn(body_pn) : premsOfPn(body_pn).splice(argIdx, 1);
    const box: pn.Box = { principle: ofCourse, auxiliaries };

    return {
      concls: [...auxiliaries, par.concls()[0]],
      boxes: [...body_pn.boxes, box],
      ctxMap: argIdx === -1 ? body_pn.ctxMap : body_pn.ctxMap.splice(argIdx, 1),
    };
  } else if (term.name === 'prim') {
    throw Error('TODO: implement');
  } else {
    // never
    return term;
  }
};
