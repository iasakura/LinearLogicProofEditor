import React from 'react';
import { useDrag } from 'react-dnd';
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
import { DroppableSpace, DropResult } from './DroppableSpace';
import { ItemType } from './ItemType';

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

const dispatchSwap = (
  dispatch: (action: EditorAction) => void,
  loc: Loc<Sequent>,
  from: number,
  to: number
) => {
  dispatch({
    name: 'proofAction',
    action: {
      name: 'moveFormula',
      loc,
      from,
      to,
    },
  });
};

const LLFormula = (props: {
  formula: Formula;
  loc: Loc<Sequent>;
  pos: number;
}) => {
  const dispatch = React.useContext(DispatcherContext);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    end: (_, monitor) => {
      const res = monitor.getDropResult();
      if (res !== null) {
        const { pos: newPos } = res as DropResult;
        dispatchSwap(dispatch, props.loc, props.pos, newPos);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  if (props.formula.name == 'var') {
    return (
      <span
        ref={drag}
        style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
      >
        <ClickableContent
          content={props.formula.var}
          onClick={dispatchApplyAx(dispatch, props.loc)}
        />
      </span>
    );
  } else if (props.formula.name === 'unary') {
    return (
      <span
        ref={drag}
        style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
      >
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
      </span>
    );
  } else if (props.formula.name === 'binary') {
    return (
      <span
        ref={drag}
        style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}
      >
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
      </span>
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
            <DroppableSpace
              text={idx > 0 ? ', ' : '\u00a0'.repeat(4)}
              pos={idx}
            />
            <LLFormula formula={f} loc={props.loc} pos={idx} />
            {idx === props.sequent.length - 1 ? (
              <DroppableSpace pos={idx + 1} text={'\u00a0'.repeat(4)} />
            ) : undefined}
          </>
        );
      })}
    </span>
  );
};
