import React from 'react';
import styled from 'styled-components';

const ProofRuleDiv = styled.div`
  margin-bottom: 1ch;
  margin-left: 0.2em;
`;

export const ProofRule = (props: { rule: string }) => {
  return <ProofRuleDiv>rule</ProofRuleDiv>;
};
