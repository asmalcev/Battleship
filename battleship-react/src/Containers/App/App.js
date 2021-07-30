import { useContext, useState } from 'react';

import Header from '../Header';
import Menu   from '../Menu';
import Game   from '../Game';

import { UserDataContext } from '../../Contexts/UserDataContext';

const App = () => {
  const userData = useContext(UserDataContext);

  return <>
    <Header>
      <h1>BattleShip</h1>
      { userData.roomId || 'null' }<br/>
      { userData.userId }
    </Header>
    {
      !!userData.roomId
      ?
        <Game />
      :
        <Menu />
    }
  </>;
}

export default App;