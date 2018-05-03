import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';


class SpatialUI extends React.Component {
    render() {
        return (
            <div>
              <CollectionSelector/>
              <div id="globe"></div>
              <button type="button" name="Go!" placeholder="">Go!</button>
              <GranuleList/>
            </div>
        );
    }
}

class CollectionSelector extends React.Component {
    render() {
        return (
            <select className="dropdown" name="collections">
              <option>IDHDT4</option>
              <option>ILATM1B</option>
              <option>ILVIS2</option>
            </select>
        )
    }
}

class GranuleList extends React.Component {
    render() {
        return (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Summary</th>
                  <th>Granules</th>
                </tr>
              </thead>
              <tbody>
              </tbody>
            </table>
        )
    }
}

// ========================================

ReactDOM.render(
    <SpatialUI />,
    document.getElementById('everest-ui')
);
