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
            },
            {
              rule: 'rule-b',
              content: 'b',
              children: [],
            },
            {
              rule: 'rule-c',
              content: 'c',
              children: [],
            },
          ],
        },
        {
          rule: 'rule2',
          content: 'grandchild2',
          children: [],
        },
      ],
    },
    {
      rule: 'rule3',
      content: 'child2',
      children: [],
    },
    {
      rule: 'rule3',
      content: 'child3',
      children: [],
    },
  ],
};

export const ProofStory = () => {
  return <DerivationTree proof={proof} renderLeaf={(s) => <span>{s}</span>} />;
};
