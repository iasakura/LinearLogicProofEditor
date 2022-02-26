import React, { ReactElement } from 'react';
import styled from 'styled-components';

const SequentDiv = styled.div<{ open: boolean }>`
  text-align: center;
  width: auto;
  padding-top: 2px;
  ${(props) => props.open && 'border-top: 1px solid;'}
`;

export function DerivationNode<T>(props: {
  node: T;
  renderLeaf: (leaf: T) => ReactElement;
  open: boolean;
}) {
  return (
    <SequentDiv open={props.open}>
      {props.renderLeaf(props.node)}
    </SequentDiv>
  );
}
