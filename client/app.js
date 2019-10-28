import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './App.jsx';

// 要用AppContainer去包裹我们根节点去渲染的内容
const root = document.getElementById('root');
const render = (Component) => {
  ReactDOM.hydrate(
    <AppContainer>
      <Component />
    </AppContainer>,
    root,
  );
};

render(App);

if (module.hot) {
  module.hot.accept('./App.jsx', () => {
    // eslint-disable-next-line global-require
    const NextApp = require('./App.jsx').default;
    render(NextApp);
  });
}
