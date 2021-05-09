import { useState, createContext, useEffect } from 'react';

import {
  theme as themeConfig
} from '../config';

export const UserDataContext = createContext({
  theme       : '',
  updateTheme : () => null,
  userId      : 0
});

// const getCookie = name => {
//   let cookieValue = null;

//   if (document.cookie && document.cookie !== '') {
//       const cookies = document.cookie.split(';');
//       for (let i = 0; i < cookies.length; i++) {
//           const cookie = cookies[i].trim();
//           // Does this cookie string begin with the name we want?
//           if (cookie.substring(0, name.length + 1) === (name + '=')) {
//               cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//               break;
//           }
//       }
//   }

//   return cookieValue;
// }

export const UserDataContextProvider = props => {
  const contextObj = {};

  const [ theme , setTheme  ] = useState('light');
  const [ userId, setUserId ] = useState(0);

  contextObj.theme       = theme;
  contextObj.updateTheme = theme => setTheme(theme);

  contextObj.userId = userId;

  /*
   * Theme application
   */
  for (let prop in themeConfig[theme]) {
    document.documentElement.style.setProperty(`--${prop}`, themeConfig[theme][prop]);
  }

  useEffect(() => {
    fetch('http://localhost:8000/init', {
      method: 'POST',
      mode: 'no-cors',
    }).then(response => console.log(response));
  }, []);

  return <UserDataContext.Provider value={ contextObj } {...props}/>;
}