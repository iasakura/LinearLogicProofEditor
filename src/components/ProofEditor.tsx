import React, { ReactElement } from 'react';
import Modal from 'react-modal';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import styled from 'styled-components';
import { Sequent } from '../linearLogic/Formula';
import { parseSequent } from '../linearLogic/parser';
import { DerivationTree, Derivation, Loc } from '../derivation-tree';
import { LLSequent } from './LLSequent';
import { reduce, DispatcherContext } from '../reducer/Reducer';
import { DetailInputForm } from './DetailInputForm';

const renderLeaf = (formula: Sequent, loc: Loc<Sequent>): ReactElement => {
  return <LLSequent sequent={formula} loc={loc} />;
};

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

const ProofEditor = (props: { proof: Derivation<Sequent> }) => {
  return (
    <ContainerDiv>
      <ProofEditorDiv>
        <DerivationTree proof={props.proof} renderLeaf={renderLeaf} />
      </ProofEditorDiv>
    </ContainerDiv>
  );
};

export const ProofApp = () => {
  const [input, setInput] = React.useState('');

  const [state, dispatch] = React.useReducer(reduce, {
    proofState: {
      name: 'waitInput',
    },
    errorState: { name: 'noError' },
  });

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    dispatch({
      name: 'proofAction',
      action: {
        name: 'setSequent',
        sequent: parseSequent(input),
      },
    });
  };

  const handleInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();
    setInput(ev.target.value);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <DispatcherContext.Provider value={dispatch}>
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

          {state.proofState.name === 'showProof' ||
          state.proofState.name === 'showModal' ||
          state.proofState.name === 'complete' ? (
            <ProofEditor proof={state.proofState.proof} />
          ) : undefined}

          <Modal
            isOpen={state.proofState.name === 'showModal'}
            onRequestClose={() => {
              dispatch({
                name: 'proofAction',
                action: {
                  name: 'closeModal',
                },
              });
            }}
          >
            {state.proofState.name === 'showModal' && (
              <DetailInputForm
                type={state.proofState.modalType}
                loc={state.proofState.loc}
                pos={state.proofState.pos}
              />
            )}
          </Modal>

          {state.errorState.name === 'showError'
            ? state.errorState.msg
            : undefined}
        </div>
      </DispatcherContext.Provider>
    </DndProvider>
  );
};
