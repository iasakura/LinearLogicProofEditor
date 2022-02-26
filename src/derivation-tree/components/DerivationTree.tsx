import React, { ReactElement } from 'react';
import styled from 'styled-components';
import { Derivation } from '../lib/Derivation';
import { DerivationTreeInternal } from './DerivationTreeInternal';

const ProofDiv = styled.div`
  display: inline-block;
  margin: auto;
`;

export function DerivationTree<T>(props: {
  proof: Derivation<T>;
  renderLeaf: (leaf: T) => ReactElement;
}) {
  return (
    <ProofDiv>
      <DerivationTreeInternal tree={props.proof} renderLeaf={props.renderLeaf} />
    </ProofDiv>
  );
}
