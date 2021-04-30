import { useState, createContext } from 'react';

import { theme as themeConfig } from '../config';

export const UserDataContext = createContext({});

export const UserDataContextProvider = props => {
  const contextObj = {};

  const [ theme , setTheme  ] = useState('light');
  const [ userId, setUserId ] = useState(null);

  contextObj.theme       = theme;
  contextObj.updateTheme = theme => setTheme(theme);

  contextObj.userId = userId;

  /*
   * Theme application
   */
  for (let prop in themeConfig[theme]) {
    document.documentElement.style.setProperty(`--${prop}`, themeConfig[theme][prop]);
  }

  return <UserDataContext.Provider value={ contextObj } {...props}/>;
}