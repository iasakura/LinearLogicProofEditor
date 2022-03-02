import { ReactElement } from 'react';
import styled from 'styled-components';
import { Loc } from '../lib/Derivation';

const SequentDiv = styled.div<{ open: boolean }>`
  text-align: center;
  width: auto;
  padding-top: 2px;
  ${(props) => !props.open && 'border-top: 1px solid;'}
`;

export function DerivationNode<T>(props: {
  node: T;
  renderLeaf: (leaf: T, loc: Loc<T>) => ReactElement;
  open: boolean;
  loc: Loc<T>;
}) {
  return (
    <SequentDiv open={props.open}>
      {props.renderLeaf(props.node, props.loc)}
    </SequentDiv>
  );
}
