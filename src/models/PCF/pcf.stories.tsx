import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

import { parseTerm } from './parser';
import { termToPN } from './pcf';
import { psToElements } from '../ProofNet/proof-net';

export default {
  title: 'PCF',
};

export const ProofNetStory = () => {
  const [termSrc, setTermSrc] = React.useState<string>(
    '(lam x: nat.  x) 3'
  );
  const [elements, setElements] =
    React.useState<cytoscape.ElementDefinition[]>();

  const cyref = React.useRef<cytoscape.Core>();

  cytoscape.use(dagre);

  const handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();
    setTermSrc(ev.target.value);
  };

  const handleSubmit = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const graph = psToElements(termToPN([], parseTerm(termSrc)))
    setElements(graph);
  };

  return (
    <div>
      <input type="text" value={termSrc} onChange={handleChange} />
      <input type="button" value={'show'} onClick={handleSubmit} />
      {elements && (
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
      )}
    </div>
  );
};
