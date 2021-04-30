import React    from 'react';
import ReactDOM from 'react-dom';
import App      from './Containers/App';

import { UserDataContextProvider } from './Contexts/UserDataContext';

import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <UserDataContextProvider>
      <App />
    </UserDataContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);