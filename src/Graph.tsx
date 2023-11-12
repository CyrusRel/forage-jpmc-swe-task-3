import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import DataStreamer, { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface IState {
  bounds?: { upper: number, lower: number}
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, IState> {
  table: Table | undefined;

  constructor(props: IProps) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      price_abc: 'float',
      price_def: 'float',
      ratio: 'float',
      timestamp: 'date',
      upper_bound: 'float',
      lower_bound: 'float',
      trigger_alert: 'float',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
      elem.setAttribute('row-pivots', '["timestamp"]');
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]');
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg',
        ratio: 'avg',
        timestamp: 'distinct count',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
      }));
    }

    //Fetch historical data and calculate bounds
    DataStreamer.getHistoricalData((historicalData) => {
      const bounds = DataManipulator.calculateBounds(historicalData);
      this.setState({ bounds });
    });
  }

  componentDidUpdate() {
    if (this.table && this.state.bounds) {
      this.table.update([
        DataManipulator.generateRow(this.props.data, this.state.bounds),
      ] as unknown as TableData);
    }
  }

    render() {
      return React.createElement('perspective-viewer');
    }
  
}

export default Graph;
