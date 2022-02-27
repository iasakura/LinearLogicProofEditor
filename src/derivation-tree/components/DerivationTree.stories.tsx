import { storiesOf } from '@storybook/react';
import React, { Children } from 'react';
import { Derivation } from '../lib/Derivation';
import { DerivationTree } from './DerivationTree';
import { DerivationNode } from './DerivationNode';

export default {
  title: 'Proof Example',
};

const proof: Derivation<string> = {
  rule: 'rule',
  content: 'aaaaaaaa',
  children: [
    {
      rule: 'rule2',
      content: 'child1',
      children: [
        {
          rule: 'rule5',
          content: 'this is toooooooo long',
          children: [
            {
              rule: 'rule-a',
              content: 'a',
              children: [],
              key: '1',
            },
            {
              rule: 'rule-b',
              content: 'b',
              children: [],
              key: '2',
            },
            {
              rule: 'rule-c',
              content: 'c',
              children: [],
              key: '3',
            },
          ],
          key: '8',
        },
        {
          rule: 'rule2',
          content: 'grandchild2',
          children: [],
          key: '4',
        },
      ],
      key: '9',
    },
    {
      rule: 'rule3',
      content: 'child2',
      children: [],
      key: '5',
    },
    {
      rule: 'rule3',
      content: 'child3',
      children: [],
      key: '6',
    },
  ],
  key: '10',
};

export const ProofStory = () => {
  return <DerivationTree proof={proof} renderLeaf={(s) => <span>{s}</span>} />;
};
