import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

import * as ps from './proof-net';

export default {
  title: 'Proof Net',
};

export const ProofNetStory = () => {
  const lam: ps.Par = {
    id: 'lam x. lam f. f (f x)',
    name: 'par',
    prems: () => [
      { from: xax, to: lam },
      { from: lam2, to: lam },
    ],
    concls: () => [{ from: lam }],
  };

  const lam2: ps.Par = {
    id: 'lam f. f (f x)',
    name: 'par',
    prems: () => [
      { from: fc, to: lam2 },
      { from: ax4, to: lam2 },
    ],
    concls: () => [{ from: lam2, to: lam }],
  };

  const fc: ps.Contraction = {
    id: 'contract f',
    name: 'contraction',
    prems: () => [
      { from: fd1, to: fc },
      { from: fd2, to: fc },
    ],
    concls: () => [{ from: fc, to: lam2 }],
  };

  const fd1: ps.Dereliction = {
    id: 'f dereliction 1',
    name: 'dereliction',
    prems: () => [{ from: fax1, to: fd1 }],
    concls: () => [{ from: fd1, to: fc }],
  };

  const fax1: ps.Ax = {
    id: 'f axiom 1',
    name: 'axiom',
    prems: () => [],
    concls: () => [
      { from: fax1, to: fd1 },
      { from: fax1, to: fcut1 },
    ],
  };

  const fcut1: ps.Cut = {
    id: 'f cut 1',
    name: 'cut',
    prems: () => [
      { from: fax1, to: fcut1 },
      { from: app_tensor1, to: fcut1 },
    ],
    concls: () => [],
  };

  const app_tensor1: ps.Tensor = {
    id: 'app tensor',
    name: 'tensor',
    prems: () => [
      { from: xax, to: app_tensor1 },
      { from: ax3, to: app_tensor1 },
    ],
    concls: () => [{ from: app_tensor1, to: fcut1 }],
  };

  const ax3: ps.Ax = {
    id: 'axiom 3',
    name: 'axiom',
    prems: () => [],
    concls: () => [
      { from: ax3, to: app_tensor1 },
      { from: ax3, to: app_tensor2 },
    ],
  };

  const app_tensor2: ps.Tensor = {
    id: 'app tensor 2',
    name: 'tensor',
    prems: () => [
      { from: ax3, to: app_tensor2 },
      { from: ax4, to: app_tensor2 },
    ],
    concls: () => [{ from: app_tensor2, to: fcut2 }],
  };

  const fd2: ps.Dereliction = {
    id: 'f dereliction 2',
    name: 'dereliction',
    prems: () => [{ from: fax2, to: fd1 }],
    concls: () => [{ from: fd1, to: fc }],
  };

  const fax2: ps.Ax = {
    id: 'f axiom 2',
    name: 'axiom',
    prems: () => [],
    concls: () => [
      { from: fax2, to: fd2 },
      { from: fax2, to: fcut2 },
    ],
  };

  const fcut2: ps.Cut = {
    id: 'f cut 2',
    name: 'cut',
    prems: () => [
      { from: fax2, to: fcut2 },
      { from: app_tensor2, to: fcut2 },
    ],
    concls: () => [],
  };

  const xax: ps.Ax = {
    id: 'fax',
    name: 'axiom',
    prems: () => [],
    concls: () => [
      { from: xax, to: lam },
      { from: xax, to: app_tensor1 },
    ],
  };

  const ax4: ps.Ax = {
    id: 'axiom 4',
    name: 'axiom',
    prems: () => [],
    concls: () => [
      { from: ax4, to: app_tensor2 },
      { from: ax4, to: lam2 },
    ],
  };

  const elements = ps.psToElements({ concls: lam.concls(), boxes: [] });

  const cyref = React.useRef<cytoscape.Core>();

  cytoscape.use(dagre);

  return (
    <div>
      <CytoscapeComponent
        elements={elements}
        stylesheet={[
          {
            selector: 'node',
            style: {
              label: 'data(label)',
              'text-valign': 'center',
              'text-halign': 'center',
            },
          },
          {
            selector: 'edge',
            style: {
              width: 3,
              'line-color': '#ccc',
              'target-arrow-color': '#ccc',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              label: 'data(label)',
            },
          },
        ]}
        layout={{ name: 'dagre' }}
        cy={(cy) => {
          cyref.current = cy;
        }}
        style={{ width: '1200px', height: '600px' }}
      />
    </div>
  );
};
