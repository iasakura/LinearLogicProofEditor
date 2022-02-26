import React from 'react';
import { DerivationNode } from './DerivationNode';

export default {
  title: 'Sequent',
};

export const SequentStory = () => {
  return (
    <DerivationNode
      node="this is test"
      renderLeaf={(s) => <div>s</div>}
      open={false}
    />
  );
};
