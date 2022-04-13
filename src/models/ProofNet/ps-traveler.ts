import { wait } from '../../util';
import { Edge } from './proof-net';

export interface GraphViewer {
  selectEdge(id: string): void;
  log(msg: string, id: string | undefined): void;
}

const WAIT_TIME = 1000;

export class GraphTraveler {
  private _current: Edge | undefined;
  constructor(private graphViewer: GraphViewer) {}

  get current(): Edge {
    if (!this._current) {
      throw Error('Current is not set yet.');
    }
    return this._current;
  }

  public setCurrent(edge: Edge) {
    this._current = edge;
  }

  public async visit(edge: Edge) {
    this.setCurrent(edge);
    this.graphViewer.selectEdge(edge.id);
    await wait(WAIT_TIME);
  }

  public async log(msg: string, edge: Edge) {
    this.graphViewer.log(msg, edge.id);
  }
}
