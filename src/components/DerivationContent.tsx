import React from 'react';
import styled from 'styled-components';
import { ProofTree } from '../lib/ProofTree';
import { Derivation } from './Derivation';
import { Sequent } from './Sequent';

const ChildrenDiv = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
`;

export const DerivationContent = (props: {
  sequent: string;
  children: ProofTree[];
}) => {
  return (
    <div>
      <ChildrenDiv>
        {props.children.map((c, idx) => (
          <Derivation
            tree={c}
            marginRight={idx !== props.children.length - 1}
          />
        ))}
      </ChildrenDiv>
      <Sequent sequent={props.sequent} />
    </div>
  );
};
