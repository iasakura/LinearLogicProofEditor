import React, { ReactElement } from 'react';
import styled from 'styled-components';
import { Derivation, Loc } from '../lib/Derivation';
import { DerivationTreeInternal } from './DerivationTreeInternal';
import { DerivationNode } from './DerivationNode';

const ChildrenDiv = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
`;

export function DerivationContent<T>(props: {
  sequent: T;
  childDerivs: Derivation<T>[];
  renderLeaf: (leaf: T, loc: Loc<T>) => ReactElement;
  open: boolean;
  loc: Loc<T>;
  key: string;
}) {
  return (
    <div>
      <ChildrenDiv>
        {props.childDerivs.map((c, idx) => (
          <DerivationTreeInternal
            tree={c}
            marginRight={idx !== props.childDerivs.length - 1}
            renderLeaf={props.renderLeaf}
            loc={props.loc.go(idx)}
            key={props.key}
          />
        ))}
      </ChildrenDiv>
      <DerivationNode
        node={props.sequent}
        renderLeaf={props.renderLeaf}
        open={props.open}
        loc={props.loc}
      />
    </div>
  );
}
