import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

import { parseTerm } from './parser';
import { termToPN } from './compile';
import { ProofStructure, psToElements } from '../ProofNet/proof-net';
import { wait } from '../../util';
import { GoiTraveler, GraphViewer } from '../ProofNet/goi';

export default {
  title: 'PCF',
};

export const ProofNetStory = () => {
  const [termSrc, setTermSrc] = React.useState<string>('(lam x: nat. x) 3');
  const [pn, setPn] = React.useState<ProofStructure>();
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
    const newPn = termToPN([], parseTerm(termSrc));
    setPn(newPn);
    const graph = psToElements(newPn);
    setElements(graph);
  };

  const visit = async (id: string) => {
    const root = cyref.current?.$(`#${id}`);
    root?.addClass('highlighted');
    await wait(500);
    root?.removeClass('highlighted');
  };

  const visitEdge = async (id: string) => {
    await visit(id);
  };

  const visitNode = async (id: string) => {
    await visit(id);
  };

  const travelerRef = React.useRef<GoiTraveler | undefined>(undefined);

  const setStart = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();

    const graphViewer: GraphViewer = {
      visitNode,
      visitEdge,
      getStart: (pn: ProofStructure) => {
        const start = cyref.current
          ?.$('root0')
          .neighborhood()
          .filter((ele) => ele.isEdge())[0];
        if (!start) {
          throw Error('Cannot find start');
        }
        console.log(start.id());
        const edge = pn.concls.find((edge) => {
          console.log(edge.id);
          return edge.id === start.id();
        });
        if (!edge) {
          // throw Error('Cannot find edge in concl');
          return pn.concls[0];
        }
        return edge;
      },
    };

    if (pn) {
      travelerRef.current = new GoiTraveler(pn, graphViewer);
      travelerRef.current.run();
    }
  };

  return (
    <div>
      <input
        type="text"
        value={termSrc}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
      <input type="button" value={'show'} onClick={handleSubmit} />
      <input type="button" value={'start'} onClick={setStart} />
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
            {
              selector: '.highlighted',
              style: {
                'background-color': '#61bffc',
                'line-color': '#61bffc',
                'target-arrow-color': '#61bffc',
                'transition-property':
                  'background-color, line-color, target-arrow-color',
                'transition-duration': 0.5,
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
