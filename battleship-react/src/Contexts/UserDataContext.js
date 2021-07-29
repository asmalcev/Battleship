import { useState, createContext, useEffect } from 'react';

import {
  theme as themeConfig
} from '../config';

const localStorageKeys = {
  'jwt'  : 'battleship_jwttoken',
  'theme': 'battleship_theme',
};

export const UserDataContext = createContext({
  theme       : '',
  updateTheme : () => null,
  userId      : 0,
  isInGame    : false
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

  const [ theme   , setTheme  ]   = useState(localStorage.getItem(localStorageKeys['theme']) || 'light');
  const [ userId  , setUserId ]   = useState(0);
  const [ isInGame, setIsInGame ] = useState(false);

  contextObj.theme       = theme;
  contextObj.updateTheme = theme => {
    localStorage.setItem(localStorageKeys['theme'], theme)
    setTheme(theme);
  }

  contextObj.userId   = userId;
  contextObj.isInGame = isInGame;

  /*
   * Theme application
   */
  for (let prop in themeConfig[theme]) {
    document.documentElement.style.setProperty(`--${prop}`, themeConfig[theme][prop]);
  }

  let jwttoken = localStorage.getItem(localStorageKeys['jwt']);

  useEffect(() => {
    fetch('http://localhost:8000/auth', {
      method: 'POST',
      body: jwttoken == null ? '' : JSON.stringify({
        jwttoken: jwttoken
      })
    }).then(response => response.json())
      .then(data => {
      console.log(data);

      localStorage.setItem(localStorageKeys['jwt'], data.jwttoken);

    }).catch(err => {
      console.log(err);
    });
  }, []);

  return <UserDataContext.Provider value={ contextObj } {...props}/>;
}