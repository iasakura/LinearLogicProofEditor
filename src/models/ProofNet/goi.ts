import { Edge, ProofStructure } from './proof-net';

export interface GraphViewer {
  visitNode(id: string): Promise<void>;
  visitEdge(id: string): Promise<void>;
  getStart(pn: ProofStructure): Edge;
}

type MultiplicativeList =
  | {
      name: 'empty';
    }
  | {
      name: 'cons';
      head: 'l' | 'r';
      tail: MultiplicativeList;
    };

type ExponentialTree =
  | {
      name: 'empty';
    }
  | {
      name: 'cons';
      head: 'L' | 'R';
      tail: ExponentialTree;
    }
  | {
      name: 'node';
      leftChild: ExponentialTree;
      rightChild: ExponentialTree;
    };

type Constant = {
  val: number | boolean | undefined;
};

type State = {
  list: MultiplicativeList;
  tree: ExponentialTree;
  constant: Constant;
  nesting: number;
};

const initState: State = {
  list: { name: 'empty' },
  tree: {
    name: 'node',
    leftChild: { name: 'empty' },
    rightChild: { name: 'empty' },
  },
  constant: { val: undefined },
  nesting: 0,
};

type Dir = 'downwards' | 'upwards';

const other = (edges: [Edge, Edge], edge: Edge): Edge => {
  if (edges[0].id === edge.id) {
    return edges[1];
  } else {
    return edges[0];
  }
};

const isDoor = (pn: ProofStructure, edge: Edge) =>
  !!pn.boxes.find((box) => {
    [...box.principle.concls(), ...box.auxiliaries].find((door) => {
      door.id === edge.id;
    });
  });

const isAuxDoor = (pn: ProofStructure, edge: Edge) =>
  !!pn.boxes.find((box) => {
    box.auxiliaries.find((door) => {
      door.id === edge.id;
    });
  });

const applyTreeTransInNesting = (
  tree: ExponentialTree,
  nesting: number,
  f: (t: ExponentialTree) => ExponentialTree
): ExponentialTree => {
  if (nesting === 0) {
    return f(tree);
  } else {
    if (tree.name === 'node') {
      return {
        ...tree,
        rightChild: applyTreeTransInNesting(tree.rightChild, nesting - 1, f),
      };
    } else {
      throw Error('Invalid form');
    }
  }
};

const getTreeTransInNesting = (
  tree: ExponentialTree,
  nesting: number
): ExponentialTree => {
  if (nesting === 0) {
    return tree;
  } else {
    if (tree.name === 'node') {
      return tree.rightChild;
    } else {
      throw Error('Invalid form');
    }
  }
};

export class GoiTraveler {
  private current: [Edge, Dir] | 'finish';
  private state: State;

  public constructor(private pn: ProofStructure, private viewer: GraphViewer) {
    this.current = [viewer.getStart(this.pn), 'upwards'];
    this.state = initState;
  }

  public async run() {
    while (true) {
      if (this.current === 'finish') {
        return;
      } else {
        const [edge, dir] = this.current;

        if (dir === 'upwards') {
          const link = edge.from;
          // If current is Link
          if (link.name === 'axiom') {
            const next = other(link.concls(), edge);
            this.current = [next, 'downwards'];
            await this.viewer.visitEdge(next.id);
          } else if (link.name === 'cut') {
            throw Error('Cannot visit cut upwards');
          } else if (link.name === 'par' || link.name === 'tensor') {
            const list = this.state.list;
            let next;
            if (list.name === 'cons' && list.head === 'l') {
              next = link.prems()[0];
              this.state = { ...this.state, list: list.tail };
              this.current = [next, 'upwards'];
            } else if (list.name === 'cons' && list.head === 'r') {
              next = link.prems()[1];
              this.state = { ...this.state, list: list.tail };
              this.current = [next, 'upwards'];
            } else {
              throw Error('Stack head should be "l" | "r"');
            }
            await this.viewer.visitEdge(next.id);
          } else if (link.name === 'ofCourse') {
            const next = link.prems()[0];
            this.current = [next, 'upwards'];
            await this.viewer.visitEdge(next.id);
          } else if (link.name === 'dereliction') {
            const tree = this.state.tree;
            this.state = {
              ...this.state,
              tree: applyTreeTransInNesting(
                tree,
                this.state.nesting,
                (tree) => {
                  if (
                    tree.name === 'node' &&
                    tree.leftChild === { name: 'empty' }
                  ) {
                    return tree.rightChild;
                  } else {
                    throw Error('Tree should be node with left □');
                  }
                }
              ),
            };
            const next = link.prems()[0];
            this.current = [next, 'upwards'];
            await this.viewer.visitEdge(next.id);
          } else if (link.name === 'weakening') {
            throw Error('Weakening must be unreachable');
          } else if (link.name === 'contraction') {
            this.state = {
              ...this.state,
              tree: applyTreeTransInNesting(
                this.state.tree,
                this.state.nesting,
                (tree) => {
                  if (tree.name === 'cons') {
                    return tree.tail;
                  } else {
                    throw Error('Tree should be cons');
                  }
                }
              ),
            };
            const tree = getTreeTransInNesting(
              this.state.tree,
              this.state.nesting
            );
            if (tree.name === 'cons') {
              if (tree.head === 'L') {
                const next = link.prems()[0];
                this.current = [next, 'upwards'];
                await this.viewer.visitEdge(next.id);
              } else if (tree.head === 'R') {
                const next = link.prems()[1];
                this.current = [next, 'upwards'];
                await this.viewer.visitEdge(next.id);
              } else {
                // never
                return tree.head;
              }
            } else {
              throw Error('Tree should be cons');
            }
          } else if (
            link.name === 'succ' ||
            link.name === 'pred' ||
            link.name === 'iszero'
          ) {
            const f =
              link.name === 'succ'
                ? (n: number) => n + 1
                : link.name === 'pred'
                ? (n: number) => n - 1
                : (n: number) => n === 0;
            if (link.concls()[1].id === edge.id) {
              const next = link.concls()[0];
              this.current = [next, 'downwards'];
              await this.viewer.visitEdge(next.id);
            } else {
              if (typeof this.state.constant.val === 'number') {
                const next = link.concls()[0];
                this.current = [next, 'downwards'];
                this.state = {
                  ...this.state,
                  constant: { val: f(this.state.constant.val) },
                };
                await this.viewer.visitEdge(next.id);
              } else {
                throw Error('Constant should be a number');
              }
            }
          } else if (link.name === 'cond') {
            const [c, th, el, res] = link.concls();
            if (edge.id === res.id) {
              const next = c;
              this.current = [next, 'downwards'];
              await this.viewer.visitEdge(next.id);
            } else if (edge.id === c.id) {
              if (typeof this.state.constant.val === 'boolean') {
                const next = this.state.constant.val ? th : el;
                this.current = [next, 'downwards'];
                this.state = {
                  ...this.state,
                  constant: { val: undefined },
                };
                await this.viewer.visitEdge(next.id);
              } else {
                throw Error('Constant should be a boolean');
              }
            } else {
              const next = res;
              this.current = [next, 'downwards'];
              await this.viewer.visitEdge(next.id);
            }
          } else if (link.name === 'constant') {
            const next = edge;
            this.current = [next, 'downwards'];
            this.state = { ...this.state, constant: { val: link.val } };
            await this.viewer.visitEdge(next.id);
          } else {
            // never
            return link.name;
          }
          if (isAuxDoor(this.pn, edge)) {
            this.state = {
              ...this.state,
              tree: applyTreeTransInNesting(
                this.state.tree,
                this.state.nesting,
                (tree) => {
                  if (tree.name === 'node' && tree.leftChild.name === 'node') {
                    return {
                      name: 'node',
                      leftChild: tree.leftChild.leftChild,
                      rightChild: {
                        name: 'node',
                        leftChild: tree.leftChild.rightChild,
                        rightChild: tree.rightChild,
                      },
                    };
                  } else {
                    throw Error('Invalid type of node');
                  }
                }
              ),
            };
          }
          if (isDoor(this.pn, edge)) {
            this.state = {
              ...this.state,
              nesting: this.state.nesting + 1,
            };
          }
        } else {
          const link = edge.to;

          if (isDoor(this.pn, edge)) {
            this.state = {
              ...this.state,
              nesting: this.state.nesting - 1,
            };
          }
          if (isAuxDoor(this.pn, edge)) {
            this.state = {
              ...this.state,
              tree: applyTreeTransInNesting(
                this.state.tree,
                this.state.nesting,
                (tree) => {
                  if (tree.name === 'node' && tree.rightChild.name === 'node') {
                    return {
                      name: 'node',
                      leftChild: {
                        name: 'node',
                        leftChild: tree.leftChild,
                        rightChild: tree.rightChild.leftChild,
                      },
                      rightChild: tree.rightChild.rightChild,
                    };
                  } else {
                    throw Error('Invalid type of node');
                  }
                }
              ),
            };
          }

          if (!link) {
            this.current = 'finish';
          } else if (link.name === 'axiom') {
            throw Error('Cannot visit axiom downwards');
          } else if (link.name === 'cut') {
            const next = other(link.prems(), edge);
            this.current = [next, 'upwards'];
            await this.viewer.visitEdge(next.id);
          } else if (link.name === 'par' || link.name === 'tensor') {
            const elm = link.prems()[0].id === edge.id ? 'l' : 'r';
            const next = link.concls()[0];
            this.current = [next, 'downwards'];
            this.state = {
              ...this.state,
              list: { name: 'cons', head: elm, tail: this.state.list },
            };
            await this.viewer.visitEdge(next.id);
          } else if (link.name === 'ofCourse') {
            const next = link.concls()[0];
            this.current = [next, 'downwards'];
            await this.viewer.visitEdge(next.id);
          } else if (link.name === 'dereliction') {
            this.state = {
              ...this.state,
              tree: applyTreeTransInNesting(
                this.state.tree,
                this.state.nesting,
                (tree) => {
                  return {
                    name: 'node',
                    leftChild: { name: 'empty' },
                    rightChild: tree,
                  };
                }
              ),
            };
            const next = link.concls()[0];
            this.current = [next, 'downwards'];
            await this.viewer.visitEdge(next.id);
          } else if (link.name === 'weakening') {
            throw Error('Weakening must be unreachable');
          } else if (link.name === 'contraction') {
            const elm = link.prems()[0].id === edge.id ? 'L' : 'R';
            const next = link.concls()[0];
            this.current = [next, 'downwards'];
            this.state = {
              ...this.state,
              tree: applyTreeTransInNesting(
                this.state.tree,
                this.state.nesting,
                (tree) => {
                  return { name: 'cons', head: elm, tail: tree };
                }
              ),
            };
            await this.viewer.visitEdge(next.id);
          } else if (
            link.name === 'succ' ||
            link.name === 'pred' ||
            link.name === 'iszero'
          ) {
            throw Error('Cannot visit primitive downwards');
          } else if (link.name === 'cond') {
            throw Error('Cannot visit primitive cond');
          } else if (link.name === 'constant') {
            throw Error('Cannot visit primitive constant');
          } else {
            // never
            return link.name;
          }
        }
      }
    }
  }
}
