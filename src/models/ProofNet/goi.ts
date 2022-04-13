import { Edge, ProofStructure } from './proof-net';
import { GraphTraveler } from './ps-traveler';

type MultiplicativeList =
  | {
      name: 'empty';
    }
  | {
      name: 'cons';
      head: 'l' | 'r';
      tail: MultiplicativeList;
    };

const mlistToString = (list: MultiplicativeList): string => {
  if (list.name === 'empty') {
    return '□';
  } else {
    const tail = mlistToString(list.tail);
    return list.head + ':' + tail;
  }
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

const etreeToString = (tree: ExponentialTree): string => {
  if (tree.name === 'empty') {
    return '□';
  } else if (tree.name === 'cons') {
    if (tree.tail.name === 'node') {
      return tree.head + ':' + '(' + etreeToString(tree.tail) + ')';
    }
    return tree.head + ':' + etreeToString(tree.tail);
  } else {
    let left = etreeToString(tree.leftChild);
    let right = etreeToString(tree.rightChild);
    if (tree.leftChild.name === 'node') {
      left = '(' + left + ')';
    }
    if (tree.rightChild.name === 'node') {
      right = '(' + right + ')';
    }
    return left + '.' + right;
  }
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

const stateToString = (state: State): string => {
  const list = mlistToString(state.list);
  const tree = etreeToString(state.tree);
  const constant = state.constant.val?.toString() ?? '□';
  const nesting = state.nesting;
  return JSON.stringify({ list, tree, constant, nesting });
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
  !!pn.boxes.find((box) =>
    [...box.principle.concls(), ...box.auxiliaries].find(
      (door) => door.id === edge.id
    )
  );

const isAuxDoor = (pn: ProofStructure, edge: Edge) =>
  !!pn.boxes.find((box) => box.auxiliaries.find((door) => door.id === edge.id));

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

export class GoIInterpreter {
  private dir: Dir;
  private state: State;

  public constructor(
    private pn: ProofStructure,
    private traveler: GraphTraveler,
    start: Edge
  ) {
    traveler.setCurrent(start);
    this.dir = 'upwards';
    this.state = initState;
  }

  public async run() {
    let next = this.traveler.current;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const edge = next;
      const promise = this.traveler.visit(edge);

      if (this.dir === 'upwards') {
        const link = edge.from;
        console.log(`${link.name}, ${this.dir}`);
        // If current is Link
        if (link.name === 'axiom') {
          next = other(link.concls(), edge);
          this.dir = 'downwards';
        } else if (link.name === 'cut') {
          throw Error('Cannot visit cut upwards');
        } else if (link.name === 'par' || link.name === 'tensor') {
          const list = this.state.list;
          if (list.name === 'cons' && list.head === 'l') {
            next = link.prems()[0];
            this.state = { ...this.state, list: list.tail };
            this.dir = 'upwards';
          } else if (list.name === 'cons' && list.head === 'r') {
            next = link.prems()[1];
            this.state = { ...this.state, list: list.tail };
            this.dir = 'upwards';
          } else {
            throw Error('Stack head should be "l" | "r"');
          }
        } else if (link.name === 'ofCourse') {
          next = link.prems()[0];
          this.dir = 'upwards';
        } else if (link.name === 'dereliction') {
          const tree = this.state.tree;
          this.state = {
            ...this.state,
            tree: applyTreeTransInNesting(tree, this.state.nesting, (tree) => {
              if (tree.name === 'node' && tree.leftChild.name === 'empty') {
                return tree.rightChild;
              } else {
                throw Error('Tree should be node with left □');
              }
            }),
          };
          next = link.prems()[0];
          this.dir = 'upwards';
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
              next = link.prems()[0];
              this.dir = 'upwards';
            } else if (tree.head === 'R') {
              next = link.prems()[1];
              this.dir = 'upwards';
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
            next = link.concls()[0];
            this.dir = 'downwards';
          } else {
            if (typeof this.state.constant.val === 'number') {
              next = link.concls()[0];
              this.dir = 'downwards';
              this.state = {
                ...this.state,
                constant: { val: f(this.state.constant.val) },
              };
            } else {
              throw Error('Constant should be a number');
            }
          }
        } else if (link.name === 'cond') {
          const [c, th, el, res] = link.concls();
          if (edge.id === res.id) {
            next = c;
            this.dir = 'downwards';
          } else if (edge.id === c.id) {
            if (typeof this.state.constant.val === 'boolean') {
              next = this.state.constant.val ? th : el;
              this.dir = 'downwards';
              this.state = {
                ...this.state,
                constant: { val: undefined },
              };
            } else {
              throw Error('Constant should be a boolean');
            }
          } else {
            next = res;
            this.dir = 'downwards';
          }
        } else if (link.name === 'constant') {
          next = edge;
          this.dir = 'downwards';
          this.state = { ...this.state, constant: { val: link.val } };
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
        console.log(`${link?.name}, ${this.dir}`);

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
          this.traveler.log(stateToString(this.state), edge);
          return;
        } else if (link.name === 'axiom') {
          throw Error('Cannot visit axiom downwards');
        } else if (link.name === 'cut') {
          next = other(link.prems(), edge);
          this.dir = 'upwards';
        } else if (link.name === 'par' || link.name === 'tensor') {
          const elm = link.prems()[0].id === edge.id ? 'l' : 'r';
          next = link.concls()[0];
          this.dir = 'downwards';
          this.state = {
            ...this.state,
            list: { name: 'cons', head: elm, tail: this.state.list },
          };
        } else if (link.name === 'ofCourse') {
          next = link.concls()[0];
          this.dir = 'downwards';
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
          next = link.concls()[0];
          this.dir = 'downwards';
        } else if (link.name === 'weakening') {
          throw Error('Weakening must be unreachable');
        } else if (link.name === 'contraction') {
          const elm = link.prems()[0].id === edge.id ? 'L' : 'R';
          next = link.concls()[0];
          this.dir = 'downwards';
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
      this.traveler.log(stateToString(this.state), edge);
      await promise;
    }
  }
}
