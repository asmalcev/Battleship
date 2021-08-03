import React    from 'react';
import ReactDOM from 'react-dom';
import App      from './Containers/App';

import { ModalContextProvider }    from './Contexts/ModalContext';
import { UserDataContextProvider } from './Contexts/UserDataContext';

import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <UserDataContextProvider>
      <ModalContextProvider>
        <App />
      </ModalContextProvider>
    </UserDataContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);