import * as React from 'react';
import * as ReactDOM from 'react-dom';

class CMR extends React.Component {
    render() {
        return (
            <div className="everest-stuff">
              <div>
                <span>Hey there!</span>
              </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <CMR />,
    document.getElementById('everest-ui')
);
