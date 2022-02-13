import React from 'react';
import styled, { css } from 'styled-components';
import { ProofTree } from '../lib/ProofTree';
import { DerivationContent } from './DerivationContent';
import { ProofRule } from './ProofRule';

const DerivationDiv = styled.div`
  display: flex;
  align-items: flex-end;
  ${(props: { marginRight: boolean }) =>
    props.marginRight
      ? css`
          margin-right: 2em;
        `
      : css`
          margin-right: 0em;
        `}
`;

export const Derivation = (props: {
  tree: ProofTree;
  marginRight?: boolean;
}) => {
  const marginRight =
    props.marginRight === undefined ? false : props.marginRight;

  return (
    <DerivationDiv marginRight={marginRight}>
      <DerivationContent
        sequent={props.tree.sequent}
        childDerivs={props.tree.children}
      />
      <ProofRule rule={props.tree.rule} />
    </DerivationDiv>
  );
};
