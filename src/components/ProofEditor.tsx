import React, { ReactElement } from 'react';
import styled from 'styled-components';
import { Sequent } from '../linearLogic/Formula';
import { parseSequent } from '../linearLogic/parser';
import { DerivationTree, Derivation } from '../derivation-tree';
import { LLSequent } from './LLSequent';

function renderLeaf(formula: Sequent): ReactElement {
  return <LLSequent sequent={formula} />;
}

function makeInitialTree(formula: Sequent): Derivation<Sequent> {
  return {
    children: [],
    content: formula,
    rule: '',
  };
}

const ContainerDiv = styled.div`
  background: #eee;
  position: relative;
  height: 1200px;
  height: 400px;
`;

const ProofEditorDiv = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%); ;
`;

export const ProofEditor = () => {
  const [input, setInput] = React.useState<string>('');
  const [proofTree, setProofTree] =
    React.useState<Derivation<Sequent> | undefined>();

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const sequent = parseSequent(input);
    setProofTree(makeInitialTree(sequent));
  };

  const handleInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();
    setInput(ev.target.value);
  };

  return (
    <div>
      <form onSubmit={(ev) => handleSubmit(ev)}>
        <label>
          Sequent: |-
          <input
            type="text"
            value={input}
            onChange={(ev) => handleInputChange(ev)}
          />
        </label>
        <input type="submit" value="Start" />
      </form>

      <ContainerDiv>
        <ProofEditorDiv>
          {proofTree !== undefined && (
            <DerivationTree proof={proofTree} renderLeaf={renderLeaf} />
          )}
        </ProofEditorDiv>
      </ContainerDiv>
    </div>
  );
};
