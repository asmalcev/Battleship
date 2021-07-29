import { useContext, useState } from 'react';

import Header from '../Header';
import Menu   from '../Menu';
import Game   from '../Game';

import { UserDataContext } from '../../Contexts/UserDataContext';

const App = () => {
  const userData = useContext(UserDataContext);

  // console.log(userData);

  return <>
    <Header>
      <h1>BattleShip</h1>
    </Header>
    {
      userData.isInGame
      ?
        <Game />
      :
        <Menu />
    }
  </>;
}

export default App;