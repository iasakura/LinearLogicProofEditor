import React from 'react';
import styled from 'styled-components';

import {
  Formula,
  Sequent,
  formulaToString,
  opToString,
  OpName,
} from '../linearLogic/Formula';
import { DispatcherContext, EditorAction } from '../reducer/Reducer';
import { Loc } from '../derivation-tree';

const BorderedSpan = styled.span`
  border: solid 1px;
`;

const ClickableSpan = styled(BorderedSpan)`
  transition: background-color 0.1s;
  &:hover {
    background-color: #ccf;
  }
`;

const ClickableContent = (props: { content: string; onClick: () => void }) => {
  return <ClickableSpan onClick={props.onClick}>{props.content}</ClickableSpan>;
};

const dispatchApplyAx =
  (dispatch: (action: EditorAction) => void, loc: Loc<Sequent>) => () => {
    dispatch({
      name: 'proofAction',
      action: { name: 'applyAx', loc: loc },
    });
  };

const opNameToActionName = (op: OpName) => {
  if (op === 'ofCourse') {
    return 'applyOfCourse';
  } else if (op === 'whyNot') {
    // TODO: other cases
    return 'applyDereliction';
  } else if (op === 'and') {
    return 'applyWith';
  } else if (op === 'or') {
    // TODO: other cases
    return 'applyPlus1';
  } else if (op === 'par') {
    return 'applyPar';
  } else if (op === 'tensor') {
    return 'applyTimes';
  }
};

const dispatchAction =
  (
    opName: OpName,
    dispatch: (action: EditorAction) => void,
    loc: Loc<Sequent>,
    pos: number
  ) =>
  () => {
    const name = opNameToActionName(opName);
    if (name === undefined) {
      return;
    }
    dispatch({
      name: 'proofAction',
      action: { name, loc, pos },
    });
  };

const LLFormula = (props: {
  formula: Formula;
  loc: Loc<Sequent>;
  pos: number;
}) => {
  const dispatch = React.useContext(DispatcherContext);

  if (props.formula.name == 'var') {
    return (
      <ClickableContent
        content={props.formula.var}
        onClick={dispatchApplyAx(dispatch, props.loc)}
      />
    );
  } else if (props.formula.name === 'unary') {
    return (
      <>
        <ClickableContent
          content={opToString(props.formula.op)}
          onClick={dispatchAction(
            props.formula.op,
            dispatch,
            props.loc,
            props.pos
          )}
        />
        {formulaToString(props.formula.children[0])}
      </>
    );
  } else if (props.formula.name === 'binary') {
    return (
      <>
        {formulaToString(props.formula.children[0])}
        <ClickableContent
          content={opToString(props.formula.op)}
          onClick={dispatchAction(
            props.formula.op,
            dispatch,
            props.loc,
            props.pos
          )}
        />
        {formulaToString(props.formula.children[1])}
      </>
    );
  } else {
    // never
    return props.formula;
  }
};

export const LLSequent = (props: { sequent: Sequent; loc: Loc<Sequent> }) => {
  return (
    <span>
      {props.sequent.map((f, idx) => {
        return (
          <>
            <LLFormula formula={f} loc={props.loc} pos={idx} />
            {idx < props.sequent.length - 1 ? ', ' : ''}
          </>
        );
      })}
    </span>
  );
};
