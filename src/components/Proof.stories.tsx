import { storiesOf } from '@storybook/react';
import React, { Children } from 'react';
import { ProofTree } from '../lib/ProofTree';
import { Proof } from './Proof';
import { Sequent } from './Sequent';

export default {
  title: 'Proof Example',
};

const proof: ProofTree = {
  rule: 'rule',
  sequent: 'aaaaaaaa',
  children: [
    {
      rule: 'rule2',
      sequent: 'child1',
      children: [
        {
          rule: 'rule5',
          sequent: 'this is toooooooo long',
          children: [
            {
              rule: 'rule-a',
              sequent: 'a',
              children: [],
            },
            {
              rule: 'rule-b',
              sequent: 'b',
              children: [],
            },
            {
              rule: 'rule-c',
              sequent: 'c',
              children: [],
            },
          ],
        },
        {
          rule: 'rule2',
          sequent: 'grandchild2',
          children: [],
        },
      ],
    },
    {
      rule: 'rule3',
      sequent: 'child2',
      children: [],
    },
    {
      rule: 'rule3',
      sequent: 'child3',
      children: [],
    },
  ],
};

export const ProofStory = () => {
  return <Proof proof={proof} />;
};
