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
  | Contraction;

export type Ax = {
  name: 'axiom';
  prems: () => [];
  concls: () => [Edge, Edge];
  id: string;
};
export type Cut = {
  name: 'cut';
  prems: () => [Edge, Edge];
  concls: () => [];
  id: string;
};
export type Par = {
  name: 'par';
  prems: () => [Edge, Edge];
  concls: () => [Edge];
  id: string;
};
export type Tensor = {
  name: 'tensor';
  prems: () => [Edge, Edge];
  concls: () => [Edge];
  id: string;
};
export type OfCourse = {
  name: 'ofCourse';
  prems: () => [Edge];
  concls: () => [Edge];
  id: string;
};
export type Dereliction = {
  name: 'dereliction';
  prems: () => [Edge];
  concls: () => [Edge];
  id: string;
};
export type Weakening = {
  name: 'weakening';
  prems: () => [];
  concls: () => [Edge];
  id: string;
};
export type Contraction = {
  name: 'contraction';
  prems: () => [Edge, Edge];
  concls: () => [Edge];
  id: string;
};

export type Constant = {
  name: number | boolean;
  prems: () => [];
  concls: () => [Edge];
};
export type Arith = {
  name: 'succ' | 'pred' | 'iszero';
  prems: () => [];
  concls: () => [Edge, Edge];
};
export type Cond = {
  name: 'cond';
  prems: () => [];
  concls: () => [Edge, Edge, Edge];
};

export type ProofStructure = {
  concls: Link[];
  boxes: Box[];
};
export type Box = { principle: Link; auxiliaries: Link[] };

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
  } else {
    throw Error('Unknown link name');
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
    boxes.find((box) => !!box.auxiliaries.find((link) => link.id === from.id))
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
      const doors = [box.principle, ...box.auxiliaries];
      return !!doors.find((door) => door.id === id);
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

  pn.concls.forEach((link) => {
    visitLink(link, undefined);
  });

  return elements;
};
