import * as fetch from 'isomorphic-fetch';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css';

import { EverestUI } from './components/EverestUI';

ReactDOM.render(
    <EverestUI />,
    document.getElementById('everest-ui')
);
