import React from 'react';
import ReactDOM from 'react-dom';
import RealApp from './App';

import { Router } from 'react-router';
import { createBrowserHistory } from 'history';

window.__eptn__ = {
  routerHistory: createBrowserHistory({
    basename: '/'
  })
};

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
              history={__eptn__.routerHistory}
              // forceRefresh={!supportsHistory}
            >
              <RealApp history={__eptn__.routerHistory} />
            </Router>
    );
  }
}

ReactDOM.render(<App name='vortesnail' age={25} />, document.querySelector('#root'));
