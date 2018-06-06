import React from 'react';
import ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader';
import './index.less';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

const AppWrapper = process.env.NODE_ENV === 'production' ? App : hot(module)(App);

ReactDOM.render(<AppWrapper />, document.getElementById('root'));

registerServiceWorker();
