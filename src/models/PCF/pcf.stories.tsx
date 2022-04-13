import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

import { parseTerm } from './parser';
import { termToPN } from './compile';
import { ProofStructure, psToElements } from '../ProofNet/proof-net';
import { GoIInterpreter } from '../ProofNet/goi';
import { GraphTraveler, GraphViewer } from '../ProofNet/ps-traveler';

export default {
  title: 'PCF',
};

export const ProofNetStory = () => {
  const [termSrc, setTermSrc] = React.useState<string>('(lam x: nat. x) 3');
  const [pn, setPn] = React.useState<ProofStructure>();
  const [elements, setElements] =
    React.useState<cytoscape.ElementDefinition[]>();
  // msg, edgeId
  const [log, setLog] = React.useState<[string, string | undefined][]>([]);
  const [_currentEdge, setCurrentEdge] =
    React.useState<string | undefined>(undefined);
  const [selectedIdx, setSelectedIdx] = React.useState<number | undefined>();

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

  const mark = (id: string) => {
    const root = cyref.current?.$(`#${id}`);
    root?.addClass('highlighted');
  };

  const unMark = (id: string) => {
    const root = cyref.current?.$(`#${id}`);
    root?.removeClass('highlighted');
  };

  const selectEdge = (id: string) => {
    setCurrentEdge((currentEdge) => {
      if (currentEdge) {
        unMark(currentEdge);
      }
      mark(id);
      return id;
    });
  };

  const setStart = (ev: React.FormEvent<HTMLInputElement>) => {
    ev.preventDefault();

    const graphViewer: GraphViewer = {
      selectEdge,
      log: (msg: string, id: string | undefined) => {
        setLog((log) => [...log, [msg, id]]);
      },
    };

    if (!pn) {
      throw Error('Set pn before run');
    }
    const startEdges = cyref.current
      ?.$('root0')
      .neighborhood()
      .filter((ele) => ele.isEdge());
    if (!startEdges) {
      throw Error('Cannot find start');
    }
    console.log(startEdges);
    const edge = pn.concls.find((edge) => {
      console.log(edge.id);
      return !!startEdges.toArray().find((e) => edge.id === e.id());
    });
    if (!edge) {
      throw Error('Cannot find edge in concl');
      // return pn.concls[0];
    }
    const start = edge;

    if (pn) {
      const graphTraveler = new GraphTraveler(graphViewer);
      new GoIInterpreter(pn, graphTraveler, start).run();
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
      <div style={{ display: 'flex' }}>
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
            style={{ width: '800px', height: '600px' }}
          />
        )}
        <div>
          {log.map(([msg, edgeId], idx) => (
            <div
              style={{
                background: selectedIdx === idx ? 'lightyellow' : 'white',
              }}
              key={idx}
              onClick={() => {
                if (edgeId) {
                  selectEdge(edgeId);
                }
                setSelectedIdx(idx);
              }}
            >
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
