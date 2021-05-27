import React from 'react';
import ReactDOM from 'react-dom';
import RealApp from './App';

// import { Router } from 'react-router';
// import { createBrowserHistory } from 'history';
//
// window.__eptn__ = {
//   routerHistory: createBrowserHistory({
//     basename: '/'
//   })
// };

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

if (module && module.hot) {
  module.hot.accept();
}

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (

            <Router
              key={Math.random()}
              basename={'/web'}
            >
              <RealApp  />
            </Router>
    );
  }
}

ReactDOM.render(<App name='vortesnail' age={25} />, document.querySelector('#root'));
