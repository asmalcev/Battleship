import { useContext, useState } from 'react';

import Header from '../Header';
import Menu   from '../Menu';
import Game   from '../Game';

import {
  localStorageKeys,
  UserDataContext
} from '../../Contexts/UserDataContext';

const App = () => {
  const userData = useContext(UserDataContext);

  const deleteHandler = e => {
    e.preventDefault();

    let jwttoken = localStorage.getItem(localStorageKeys['jwt']); // access token
    fetch('http://localhost:8000/delete', {
      method: 'POST',
      body: jwttoken == null ? '' : JSON.stringify({
        jwttoken: jwttoken,
        roomId: userData.roomId,
        userId: userData.userId
      })
    }).then(response => response.text())
      .then(data => {
        console.log(data);
        userData.updateRoom(null);

    }).catch(err => {
      console.log(err);
    });
  }

  return <>
    <Header>
      <h1>BattleShip</h1>
      { userData.roomId || 'null' }<br/>
      { userData.userId }
    </Header>
    {
      !!userData.roomId
      ?
        <>
          <h3 onClick={ deleteHandler }>exit room</h3>
          <Game />
        </>
      :
        <Menu />
    }
  </>;
}

export default App;