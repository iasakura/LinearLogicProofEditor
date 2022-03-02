import { ReactElement } from 'react';
import styled, { css } from 'styled-components';
import { Derivation, Loc } from '../lib/Derivation';
import { DerivationContent } from './DerivationContent';

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

const ProofRuleDiv = styled.div`
  margin-bottom: 1ch;
  margin-left: 0.2em;
`;

const ProofRule = (props: { rule: string }) => {
  return <ProofRuleDiv>{props.rule}</ProofRuleDiv>;
};

export function DerivationTreeInternal<T>(props: {
  tree: Derivation<T>;
  marginRight?: boolean;
  loc: Loc<T>;
  renderLeaf: (leaf: T, loc: Loc<T>) => ReactElement;
}) {
  const marginRight =
    props.marginRight === undefined ? false : props.marginRight;

  const [childDerivs, open] =
    props.tree.children === 'open' ? [[], true] : [props.tree.children, false];

  return (
    <DerivationDiv marginRight={marginRight}>
      <DerivationContent
        sequent={props.tree.content}
        childDerivs={childDerivs}
        renderLeaf={props.renderLeaf}
        open={open}
        loc={props.loc}
        key={props.tree.key}
      />
      <ProofRule rule={props.tree.rule} />
    </DerivationDiv>
  );
}
