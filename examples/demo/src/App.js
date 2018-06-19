import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import axios from 'axios';
import logo from './logo.png';
import styles from './App.less';

class App extends Component {
  componentDidMount() {
    axios.get('/api/user')
      .then(res => {
        console.log('*** res: ', res); // eslint-disable-line no-console
      })
      .catch(error => {
        console.log('*** error: ', error); // eslint-disable-line no-console
      });
  }

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
