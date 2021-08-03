import { useState, createContext, useEffect, useRef } from 'react';

import {
  theme as themeConfig,
  config
} from '../config';

export const localStorageKeys = {
  'jwt'  : 'battleship_jwttoken',
  'theme': 'battleship_theme',
};

export const UserDataContext = createContext({
  theme     : '',
  userId    : 0,
  roomId    : null,
  isHost    : { current: false },

  updateTheme : () => null,
  updateRoom  : () => null,
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

  const [ theme     , setTheme  ] = useState(localStorage.getItem(localStorageKeys['theme']) || 'light');
  const [ userId    , setUserId ] = useState(0);
  const [ roomId    , setRoomId ] = useState(null);

  const isHost = useRef(false);

  contextObj.theme       = theme;
  contextObj.updateTheme = theme => {
    localStorage.setItem(localStorageKeys['theme'], theme);
    setTheme(theme);
  }

  contextObj.userId = userId;
  contextObj.roomId = roomId;
  contextObj.isHost = isHost;

  contextObj.updateRoom = roomId => {
    setRoomId(roomId);
  }

  /*
   * Theme application
   */
  for (let prop in themeConfig[theme]) {
    document.documentElement.style.setProperty(`--${prop}`, themeConfig[theme][prop]);
  }

  /*
   * Updating data from server
   */
  let jwttoken = localStorage.getItem(localStorageKeys['jwt']); // access token
  useEffect(() => {
    fetch(`http://${config.battleshipServer.host}/auth`, {
      method: 'POST',
      body: jwttoken == null ? '' : JSON.stringify({
        jwttoken: jwttoken
      })
    }).then(response => response.json())
      .then(data => {
      setUserId(data.id);
      setRoomId(data.roomId);

      localStorage.setItem(localStorageKeys['jwt'], data.jwttoken);
    }).catch(err => {
      console.log(err);
    });
  }, [jwttoken]);

  return <UserDataContext.Provider value={ contextObj } {...props}/>;
}