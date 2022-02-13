import React from 'react';
import styled from 'styled-components';
import { ProofTree } from '../lib/ProofTree';
import { Derivation } from './Derivation';

const ProofDiv = styled.div`
  display: inline-block;
  margin: auto;
`;

export const Proof = (props: { proof: ProofTree }) => {
  return (
    <ProofDiv>
      <Derivation tree={props.proof} />
    </ProofDiv>
  );
};
