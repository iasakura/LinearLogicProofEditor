import * as uuid from 'uuid';

const unreachable = () => {
  throw Error('unreachable');
};

export type Edge = { from: Link; to?: Link };

export type AbstractLink = {
  name: string;
  prems: () => Edge[];
  concls: () => Edge[];
  id: string;
};
export type Link =
  | Ax
  | Cut
  | Par
  | Tensor
  | OfCourse
  | Dereliction
  | Weakening
  | Contraction
  | Constant
  | Prim
  | Cond;

export type Ax = {
  name: 'axiom';
  prems: () => [];
  concls: () => [Edge, Edge];
  id: string;
};

export const Ax = (): Ax => {
  let concls: [Edge, Edge] | undefined = undefined;
  const node: Ax = {
    name: 'axiom',
    prems: () => [],
    concls: () => concls ?? unreachable(),
    id: uuid.v4(),
  };
  concls = [{ from: node }, { from: node }];
  return node;
};

export type Cut = {
  name: 'cut';
  prems: () => [Edge, Edge];
  concls: () => [];
  id: string;
};

export const Cut = (prem1: Edge, prem2: Edge) => {
  const cut: Cut = {
    name: 'cut',
    prems: () => [prem1, prem2],
    concls: () => [],
    id: uuid.v4(),
  };
  prem1.to = cut;
  prem2.to = cut;
  return cut;
};

export type Par = {
  name: 'par';
  prems: () => [Edge, Edge];
  concls: () => [Edge];
  id: string;
};

export const Par = (prem1: Edge, prem2: Edge) => {
  let concls: [Edge] | undefined = undefined;
  const par: Par = {
    name: 'par',
    prems: () => [prem1, prem2],
    concls: () => concls ?? unreachable(),
    id: uuid.v4(),
  };
  (concls = [{ from: par }]), (prem1.to = par);
  prem2.to = par;

  return par;
};

export type Tensor = {
  name: 'tensor';
  prems: () => [Edge, Edge];
  concls: () => [Edge];
  id: string;
};

export const Tensor = (prem1: Edge, prem2: Edge) => {
  let concls: [Edge] | undefined = undefined;
  const tensor: Tensor = {
    name: 'tensor',
    prems: () => [prem1, prem2],
    concls: () => concls ?? unreachable(),
    id: uuid.v4(),
  };
  (concls = [{ from: tensor }]), (prem1.to = tensor);
  prem2.to = tensor;

  return tensor;
};

export type OfCourse = {
  name: 'ofCourse';
  prems: () => [Edge];
  concls: () => [Edge];
  id: string;
};

export const OfCourse = (prem: Edge): OfCourse => {
  let concls: [Edge] | undefined = undefined;
  const ofCourse: OfCourse = {
    name: 'ofCourse',
    prems: () => [prem],
    concls: () => concls ?? unreachable(),
    id: uuid.v4(),
  };
  concls = [{ from: ofCourse }];
  prem.to = ofCourse;

  return ofCourse;
};

export type Dereliction = {
  name: 'dereliction';
  prems: () => [Edge];
  concls: () => [Edge];
  id: string;
};

export const Dereliction = (prem: Edge): Dereliction => {
  let concls: [Edge] | undefined = undefined;
  const dereliction: Dereliction = {
    name: 'dereliction',
    prems: () => [prem],
    concls: () => concls ?? unreachable(),
    id: uuid.v4(),
  };
  prem.to = dereliction;
  concls = [
    {
      from: dereliction,
    },
  ];
  return dereliction;
};

export type Weakening = {
  name: 'weakening';
  prems: () => [];
  concls: () => [Edge];
  id: string;
};

export const Weakening = () => {
  let concls: [Edge] | undefined = undefined;
  const weakening: Weakening = {
    name: 'weakening',
    prems: () => [],
    concls: () => concls ?? unreachable(),
    id: uuid.v4(),
  };
  concls = [{ from: weakening }];
  return weakening;
};

export type Contraction = {
  name: 'contraction';
  prems: () => [Edge, Edge];
  concls: () => [Edge];
  id: string;
};
export const Contraction = (prem1: Edge, prem2: Edge) => {
  let concls: [Edge] | undefined = undefined;
  const contraction: Contraction = {
    name: 'contraction',
    prems: () => [prem1, prem2],
    concls: () => concls ?? unreachable(),
    id: uuid.v4(),
  };
  concls = [{ from: contraction }];
  prem1.to = contraction;
  prem2.to = contraction;

  return contraction;
};

export type Constant = {
  name: 'constant';
  val: number | boolean;
  prems: () => [];
  concls: () => [Edge];
  id: string;
};

export const Constant = (n: number | boolean): Constant => {
  let concls: [Edge] | undefined = undefined;
  const c: Constant = {
    name: 'constant',
    val: n,
    prems: () => [],
    concls: () => concls ?? unreachable(),
    id: uuid.v4(),
  };
  concls = [
    {
      from: c,
    },
  ];
  return c;
};

export type Prim = {
  name: 'succ' | 'pred' | 'iszero';
  prems: () => [];
  concls: () => [Edge, Edge];
  id: string;
};

export type Cond = {
  name: 'cond';
  prems: () => [];
  concls: () => [Edge, Edge, Edge];
  id: string;
};

export type ProofStructure = {
  concls: Edge[];
  boxes: Box[];
};
export type Box = { principle: OfCourse; auxiliaries: Edge[] };

const linkNameToString = (op: string) => {
  if (op === 'tensor') {
    return '⊗';
  } else if (op === 'par') {
    return '⅋';
  } else if (op === 'axiom') {
    return 'Ax';
  } else if (op === 'cut') {
    return 'Cut';
  } else if (op === 'ofCourse') {
    return '!';
  } else if (op === 'dereliction') {
    return 'd';
  } else if (op === 'contraction') {
    return 'c';
  } else if (op === 'weakening') {
    return 'w';
  } else if (op === 'constant') {
    // TODO
    return 'T';
  } else {
    return op;
  }
};

export type Label = '0' | '1' | 'p' | 'q' | 'r' | 's' | 't' | 'd';

const getIndexOfEdgeInPrem = (from: Link, to: Link): number => {
  const res = to.prems().findIndex((e) => e.from.id === from.id);
  if (res < 0) {
    throw Error('Cannot find from');
  }
  return res;
};

const labelOfEdge = (edge: Edge, boxes: Box[]): Label[] => {
  const { from, to } = edge;
  if (to === undefined) {
    throw Error('Conclusion');
  }
  const labels: Label[] = [];
  if (
    boxes.find(
      (box) =>
        !!box.auxiliaries.find(
          (edge) => edge.from.id === from.id && edge.to?.id === to.id
        )
    )
  ) {
    labels.push('t');
  }

  if (to.name === 'tensor' || to.name === 'par') {
    if (getIndexOfEdgeInPrem(from, to) === 0) {
      labels.push('p');
    } else {
      labels.push('q');
    }
  } else if (to.name === 'contraction') {
    if (getIndexOfEdgeInPrem(from, to) === 0) {
      labels.push('r');
    } else {
      labels.push('s');
    }
  } else if (to.name === 'dereliction') {
    labels.push('d');
  } else if (to.name === 'weakening') {
    labels.push('0');
  }

  return labels;
};

const toCytoscopeLabel = (ls: Label[]): string => {
  if (ls.length === 0) {
    return '1';
  } else {
    return ls.join('');
  }
};

export const psToElements = (
  pn: ProofStructure
): cytoscape.ElementDefinition[] => {
  const visited = new Set<string>();
  const boxNames = new Map<string, string>();
  const elements: cytoscape.ElementDefinition[] = [];

  let rootCnt = 0;

  const getBox = (id: string): Box | undefined => {
    return pn.boxes.find((box) => {
      const doors = [...box.principle.concls(), ...box.auxiliaries];
      return !!doors.find((door) => door.from.id === id);
    });
  };

  const visitLink = (link: Link, currentBox: undefined | string) => {
    if (visited.has(link.id)) {
      return;
    }
    visited.add(link.id);

    const box = getBox(link.id);
    const newBox = box ? box.principle.id : currentBox;

    if (newBox && !boxNames.get(newBox)) {
      const name = `box${boxNames.size + 1}`;
      boxNames.set(newBox, name);
      elements.push({
        group: 'nodes',
        data: {
          id: name,
          parent: currentBox,
          label: '!',
        },
      });
    }

    elements.push({
      group: 'nodes',
      data: {
        id: link.id,
        label: linkNameToString(link.name),
        parent: !newBox ? newBox : boxNames.get(newBox),
      },
    });

    link.prems().forEach((edge) => {
      elements.push({
        group: 'edges',
        data: {
          source: edge.from.id,
          target: link.id,
          id: edge.from.id + '->' + link.id,
          label: toCytoscopeLabel(labelOfEdge(edge, pn.boxes)),
        },
      });
      if (!visited.has(edge.from.id)) {
        visitLink(edge.from, currentBox);
      }
    });

    link.concls().forEach((edge) => {
      if (edge.to) {
        elements.push({
          group: 'edges',
          data: {
            source: link.id,
            target: edge.to.id,
            id: link.id + '->' + edge.to.id,
            label: toCytoscopeLabel(labelOfEdge(edge, pn.boxes)),
          },
        });
        if (!visited.has(edge.to.id)) {
          visitLink(edge.to, currentBox);
        }
      } else {
        const rootId = `root${rootCnt++}`;
        elements.push(
          {
            group: 'edges',
            data: {
              source: link.id,
              target: rootId,
              id: link.id + '->' + rootId,
            },
          },
          {
            group: 'nodes',
            data: {
              id: rootId,
              parent: currentBox,
              label: 'root',
            },
          }
        );
      }
    });
  };

  pn.concls.forEach((edge) => {
    visitLink(edge.from, undefined);
  });

  return elements;
};
