import * as pn from '../ProofNet/proof-net';
import { Context, Term, Var } from './types';

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

    console.log(`${f_pn.ctxMap}`);
    console.log(`${arg_pn.ctxMap}`);

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

    const auxiliaries = premsOfPn(body_pn);
    if (argIdx >= 0) {
      auxiliaries.splice(argIdx, 1);
    }
    const box: pn.Box = { principle: ofCourse, auxiliaries };

    const ctxMap = body_pn.ctxMap;
    if (argIdx >= 0) {
      ctxMap.splice(argIdx, 1);
    }

    return {
      concls: [...auxiliaries, ofCourse.concls()[0]],
      boxes: [...body_pn.boxes, box],
      ctxMap,
    };
  } else if (term.name === 'prim') {
    if (term.v === 'succ' || term.v === 'pred' || term.v === 'iszero') {
      const prim = pn.Prim(term.v);
      const inp = pn.Dereliction(prim.concls()[0]);
      const out = pn.OfCourse(prim.concls()[1]);
      const box1: pn.Box = { principle: out, auxiliaries: inp.concls() };
      const par = pn.Par(inp.concls()[0], out.concls()[0]);
      const ofCourse = pn.OfCourse(par.concls()[0]);
      const box2: pn.Box = { principle: ofCourse, auxiliaries: [] };

      return {
        concls: ofCourse.concls(),
        boxes: [box1, box2],
        ctxMap: [],
      };
    } else if (term.v === 'cond') {
      const cond = pn.Cond();
      const [c, th, el, res] = cond.concls();
      const dc = pn.Dereliction(c);
      const or = pn.OfCourse(res);
      const box1: pn.Box = {
        principle: or,
        auxiliaries: [...dc.concls(), th, el],
      };
      const f1 = pn.Par(el, or.concls()[0]);
      const f1o = pn.OfCourse(f1.concls()[0]);
      const box2: pn.Box = {
        principle: f1o,
        auxiliaries: [...dc.concls(), th],
      };
      const f2 = pn.Par(th, f1o.concls()[0]);
      const f2o = pn.OfCourse(f2.concls()[0]);
      const box3: pn.Box = {
        principle: f2o,
        auxiliaries: [...dc.concls()],
      };
      const f3 = pn.Par(dc.concls()[0], f2o.concls()[0]);
      const f3o = pn.OfCourse(f3.concls()[0]);
      const box4: pn.Box = {
        principle: f3o,
        auxiliaries: [],
      };

      return {
        concls: f3o.concls(),
        boxes: [box1, box2, box3, box4],
        ctxMap: [],
      };
    } else {
      throw Error('unimplemented');
    }
  } else {
    // never
    return term;
  }
};
