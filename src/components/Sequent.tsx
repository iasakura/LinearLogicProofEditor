import React from 'react';
import styled from 'styled-components';

type Sequent = string;

const SequentDiv = styled.div`
  text-align: center;
  border-top: 1px solid;
  width: auto;
`;

export const Sequent = (props: { sequent: Sequent }) => {
  return <SequentDiv>{props.sequent}</SequentDiv>;
};
