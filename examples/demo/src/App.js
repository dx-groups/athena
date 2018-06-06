import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import logo from './logo.png';
import './App.less';

class App extends Component {
  render() {
    return (
      <div className="app">
        <header className="app_header">
          <img src={logo} className="app_logo" alt="logo" />
          <h1 className="app_title">Hello, athena</h1>
        </header>
        <p className="app_intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

// export default App;
export default hot(module)(App);
