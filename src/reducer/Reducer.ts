import assert from 'assert';
import React from 'react';
import { Derivation, Loc } from '../derivation-tree';
import {
  applyAndRule,
  applyContractionRule,
  applyCutRule,
  applyDerelictionRule,
  applyOfCourseRule,
  applyOr1Rule,
  applyOr2Rule,
  applyParRule,
  applyTensorRule,
  applyWeakeningRule,
  checkAxiomRule,
} from '../models/linearLogic/derivationRule';
import { Formula, Sequent } from '../models/linearLogic/Formula';
import { todo } from '../util';
import * as uuid from 'uuid';

export type EditorState = {
  proofState: ProofState;
  errorState: ErrorState;
};

export type ErrorState =
  | { name: 'showError'; msg: string }
  | { name: 'noError' };

export type ProofState =
  | {
      name: 'waitInput';
    }
  | {
      name: 'showProof';
      proof: Derivation<Sequent>;
    }
  | {
      name: 'showModal';
      modalType: 'whyNot' | 'plus' | 'cut';
      proof: Derivation<Sequent>;
      loc: Loc<Sequent>;
      pos: number;
    }
  | {
      name: 'complete';
      proof: Derivation<Sequent>;
    };

export type ProofAction =
  | {
      name: 'setSequent';
      sequent: Sequent;
    }
  | {
      name: 'moveFormula';
      loc: Loc<Sequent>;
      from: number;
      to: number;
    }
  | {
      name: 'applyAx';
      loc: Loc<Sequent>;
    }
  | {
      name: 'applyCut';
      loc: Loc<Sequent>;
      pos: number;
      cutFormula: Formula;
    }
  | {
      name: 'applyTimes';
      loc: Loc<Sequent>;
      pos: number;
    }
  | {
      name: 'applyPar';
      loc: Loc<Sequent>;
      pos: number;
    }
  | {
      name: 'applyWith';
      loc: Loc<Sequent>;
      pos: number;
    }
  | {
      name: 'applyPlus1';
      loc: Loc<Sequent>;
      pos: number;
    }
  | {
      name: 'applyPlus2';
      loc: Loc<Sequent>;
      pos: number;
    }
  | {
      name: 'applyOfCourse';
      loc: Loc<Sequent>;
      pos: number;
    }
  | {
      name: 'applyWeakening';
      loc: Loc<Sequent>;
      pos: number;
    }
  | {
      name: 'applyDereliction';
      loc: Loc<Sequent>;
      pos: number;
    }
  | {
      name: 'applyContraction';
      loc: Loc<Sequent>;
      pos: number;
    }
  | {
      name: 'showWhyNotModal';
      loc: Loc<Sequent>;
      pos: number;
    }
  | {
      name: 'showPlusModal';
      loc: Loc<Sequent>;
      pos: number;
    }
  | {
      name: 'showCutModal';
      loc: Loc<Sequent>;
      pos: number;
    }
  | {
      name: 'closeModal';
    };

export type EditorAction = { name: 'proofAction'; action: ProofAction };

const makeInitialTree = (formula: Sequent): Derivation<Sequent> => {
  return {
    children: 'open',
    content: formula,
    rule: '',
    key: uuid.v4(),
  };
};

const applyCut = (
  state: EditorState,
  loc: Loc<Sequent>,
  pos: number,
  cutFormula: Formula
): EditorState => {
  const sequent = loc.tree.content;
  const newSequents = applyCutRule(sequent, pos, cutFormula);

  assert(newSequents !== undefined);

  return {
    ...state,
    proofState: {
      name: 'showProof',
      proof: loc.replaceWith({
        content: sequent,
        /// Remove 'apply' at begin
        rule: 'Cut',
        children: newSequents.map((seq) => {
          return {
            children: 'open',
            rule: '',
            content: seq,
            key: uuid.v4(),
          };
        }),
        key: uuid.v4(),
      }),
    },
  };
};

const applyRule = (
  state: EditorState,
  name: string,
  loc: Loc<Sequent>,
  pos: number
): EditorState => {
  const sequent = loc.tree.content;
  const newSequents =
    name === 'applyTimes'
      ? applyTensorRule(sequent, pos)
      : name === 'applyPar'
      ? applyParRule(sequent, pos)
      : name === 'applyWith'
      ? applyAndRule(sequent, pos)
      : name === 'applyPlus1'
      ? applyOr1Rule(sequent, pos)
      : name === 'applyPlus2'
      ? applyOr2Rule(sequent, pos)
      : name === 'applyOfCourse'
      ? applyOfCourseRule(sequent, pos)
      : name === 'applyWeakening'
      ? applyWeakeningRule(sequent, pos)
      : name === 'applyDereliction'
      ? applyDerelictionRule(sequent, pos)
      : name === 'applyContraction'
      ? applyContractionRule(sequent, pos)
      : undefined;

  if (newSequents === undefined) {
    return {
      ...state,
      errorState: {
        name: 'showError',
        msg: `Cannot apply ${name}`,
      },
    };
  }

  return {
    ...state,
    proofState: {
      name: 'showProof',
      proof: loc.replaceWith({
        content: sequent,
        /// Remove 'apply' at begin
        rule: name.slice('apply'.length),
        children: newSequents.map((seq) => {
          return {
            children: 'open',
            rule: '',
            content: seq,
            key: uuid.v4(),
          };
        }),
        key: uuid.v4(),
      }),
    },
  };
};

const applyMove = (
  state: EditorState,
  loc: Loc<Sequent>,
  from: number,
  to: number
): EditorState => {
  if (state.proofState.name !== 'showProof') {
    return {
      ...state,
      errorState: {
        name: 'showError',
        msg: 'Invalid move',
      },
    };
  }

  const rule = loc.tree.rule;
  const children = loc.tree.children;
  const sequent = loc.tree.content;

  if (children !== 'open') {
    return {
      ...state,
      errorState: {
        name: 'showError',
        msg: 'Invalid move',
      },
    };
  }

  const left = sequent.slice(0, from);
  const target = sequent[from];
  const right = sequent.slice(from + 1);

  let newSequent;
  if (to < from) {
    const left1 = left.slice(0, to);
    const left2 = left.slice(to);
    newSequent = left1.concat(target, ...left2, ...right);
  } else {
    to -= from + 1;
    const right1 = right.slice(0, to);
    const right2 = right.slice(to);
    newSequent = left.concat(...right1, target, ...right2);
  }

  return {
    ...state,
    proofState: {
      name: 'showProof',
      proof: loc.replaceWith({
        content: newSequent,
        rule,
        children,
        key: uuid.v4(),
      }),
    },
  };
};

const reduceProofState = (
  state: EditorState,
  action: ProofAction
): EditorState => {
  const { proofState } = state;

  if (action.name === 'setSequent') {
    return {
      proofState: {
        name: 'showProof',
        proof: makeInitialTree(action.sequent),
      },
      errorState: {
        name: 'noError',
      },
    };
  }

  if (proofState.name === 'showProof' || proofState.name === 'showModal') {
    if (action.name === 'applyAx') {
      if (checkAxiomRule(action.loc.tree.content)) {
        return {
          ...state,
          proofState: {
            name: 'showProof',
            proof: action.loc.replaceWith({
              content: action.loc.tree.content,
              rule: 'Ax',
              children: [],
              key: uuid.v4(),
            }),
          },
        };
      } else {
        return {
          ...state,
          errorState: {
            name: 'showError',
            msg: 'Cannot apply Ax',
          },
        };
      }
    } else if (action.name === 'applyCut') {
      return applyCut(state, action.loc, action.pos, action.cutFormula);
    } else if (
      action.name === 'applyTimes' ||
      action.name === 'applyPar' ||
      action.name === 'applyWith' ||
      action.name === 'applyPlus1' ||
      action.name === 'applyPlus2' ||
      action.name === 'applyOfCourse' ||
      action.name === 'applyWeakening' ||
      action.name === 'applyDereliction' ||
      action.name === 'applyContraction'
    ) {
      return applyRule(state, action.name, action.loc, action.pos);
    } else if (action.name === 'moveFormula') {
      return applyMove(state, action.loc, action.from, action.to);
    } else if (action.name === 'showWhyNotModal') {
      return {
        ...state,
        proofState: {
          proof: proofState.proof,
          name: 'showModal',
          modalType: 'whyNot',
          loc: action.loc,
          pos: action.pos,
        },
      };
    } else if (action.name === 'showPlusModal') {
      return {
        ...state,
        proofState: {
          proof: proofState.proof,
          name: 'showModal',
          modalType: 'plus',
          loc: action.loc,
          pos: action.pos,
        },
      };
    } else if (action.name === 'showCutModal') {
      return {
        ...state,
        proofState: {
          proof: proofState.proof,
          name: 'showModal',
          modalType: 'cut',
          loc: action.loc,
          pos: action.pos,
        },
      };
    } else if (action.name === 'closeModal') {
      return {
        ...state,
        proofState: {
          proof: proofState.proof,
          name: 'showProof',
        },
      };
    } else {
      // never
      return action;
    }
  } else {
    return todo('implement');
  }
};

export const reduce = (
  state: EditorState,
  action: EditorAction
): EditorState => {
  if (action.name === 'proofAction') {
    return reduceProofState(state, action.action);
  } else {
    // never
    return action.name;
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const DispatcherContext = React.createContext((action: EditorAction) => {
  return;
});
