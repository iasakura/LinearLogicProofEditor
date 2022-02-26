import assert from 'assert';
import React from 'react';
import { Derivation, Loc } from '../derivation-tree';
import { checkAxiomRule } from '../linearLogic/derivationRule';
import { Formula, Sequent } from '../linearLogic/Formula';
import { todo } from '../util';

export type State =
  | {
      name: 'showProof';
      proof: Derivation<Sequent>;
    }
  | {
      name: 'showError';
      msg: string;
      proof: Derivation<Sequent>;
    }
  | {
      // TODO
      name: 'showModal';
      proof: Derivation<Sequent>;
      modalMenu: any;
    }
  | {
      name: 'complete';
    };

export type Action =
  | {
      name: 'applyAx';
      loc: Loc<Sequent>;
    }
  | {
      name: 'applyCut';
      loc: Loc<Sequent>;
      pos: number;
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
    };

export const reduce = (state: State, action: Action): State => {
  if (state.name === 'showProof' || state.name === 'showError') {
    if (action.name === 'applyAx') {
      const leaf = action.loc.tree;

      assert(leaf.children === 'open');

      if (checkAxiomRule(leaf.content)) {
        return {
          name: 'showProof',
          proof: action.loc.replaceWith({
            ...leaf,
            children: [],
          }),
        };
      } else {
        return {
          name: 'showError',
          msg: 'Cannot apply Ax',
          proof: state.proof,
        };
      }
    } else if (action.name === 'applyCut') {
      return todo('implement');
    } else if (action.name === 'applyTimes') {
      return todo('implement');
    } else if (action.name === 'applyPar') {
      return todo('implement');
    } else if (action.name === 'applyWith') {
      return todo('implement');
    } else if (action.name === 'applyPlus1') {
      return todo('implement');
    } else if (action.name === 'applyPlus2') {
      return todo('implement');
    } else if (action.name === 'applyOfCourse') {
      return todo('implement');
    } else if (action.name === 'applyWeakening') {
      return todo('implement');
    } else if (action.name === 'applyDereliction') {
      return todo('implement');
    } else if (action.name === 'applyContraction') {
      return todo('implement');
    } else {
      // never
      return action;
    }
  } else {
    return todo('implement');
  }
};
