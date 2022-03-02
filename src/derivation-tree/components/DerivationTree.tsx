import { ReactElement } from 'react';
import styled from 'styled-components';
import { Derivation, Loc, makeTop } from '../lib/Derivation';
import { DerivationTreeInternal } from './DerivationTreeInternal';

const ProofDiv = styled.div`
  display: inline-block;
  margin: auto;
`;

export function DerivationTree<T>(props: {
  proof: Derivation<T>;
  renderLeaf: (leaf: T, loc: Loc<T>) => ReactElement;
}) {
  const loc = makeTop(props.proof);

  return (
    <ProofDiv>
      <DerivationTreeInternal
        tree={props.proof}
        renderLeaf={props.renderLeaf}
        loc={loc}
      />
    </ProofDiv>
  );
}
