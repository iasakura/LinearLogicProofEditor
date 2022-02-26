import React from 'react';
import styled from 'styled-components';
import { Formula, formulaToString, opToString } from '../linearLogic/Formula';

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

const LLFormula = (props: { formula: Formula }) => {
  if (props.formula.name == 'var') {
    return (
      <ClickableContent
        content={props.formula.var}
        onClick={() => {
          console.log('Called');
        }}
      />
    );
  } else if (props.formula.name === 'unary') {
    return (
      <>
        <ClickableContent
          content={opToString(props.formula.op)}
          onClick={() => 0}
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
          onClick={() => 0}
        />
        {formulaToString(props.formula.children[1])}
      </>
    );
  } else {
    // never
    return props.formula;
  }
};

export const LLSequent = (props: { sequent: Formula[] }) => {
  return (
    <span>
      {props.sequent.map((f, idx) => {
        return (
          <>
            <LLFormula formula={f} />
            {idx < props.sequent.length - 1 ? ', ' : ''}
          </>
        );
      })}
    </span>
  );
};
