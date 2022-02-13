import React from 'react';
import styled from 'styled-components';
import { ProofTree } from '../lib/ProofTree';
import { Formula, formulaToString } from '../linearLogic/Formula';
import { parse } from '../linearLogic/parser';
import { Proof } from './Proof';

function makeInitialTree(formula: Formula): ProofTree {
  return {
    sequent: formulaToString(formula),
    rule: '?',
    children: [],
  };
}

export const ProofEditor = () => {
  const [input, setInput] = React.useState<string>('');
  const [proofTree, setProofTree] = React.useState<ProofTree | undefined>();

  const ContainerDiv = styled.div`
    background: #EEE;
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

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const tree = parse(input);
    setProofTree(makeInitialTree(tree));
  };

  const handleInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();
    setInput(ev.target.value);
  };

  return (
    <div>
      <form onSubmit={(ev) => handleSubmit(ev)}>
        <label>
          Sequent:
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
          {proofTree !== undefined && <Proof proof={proofTree} />}
        </ProofEditorDiv>
      </ContainerDiv>
    </div>
  );
};
