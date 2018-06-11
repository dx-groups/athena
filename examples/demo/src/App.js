import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import logo from './logo.png';
import styles from './App.less';

class App extends Component {
  render() {
    return (
      <div className={styles.app}>
        <header className={styles.app_header}>
          <img src={logo} alt="logo" />
          <h1>Hello, athena</h1>
        </header>
        <p className={styles.app_intro}>
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

// export default App;
export default hot(module)(App);
