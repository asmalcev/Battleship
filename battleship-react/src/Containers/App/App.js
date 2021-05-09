import { useContext, useState } from 'react';

import Header from '../Header';
import Menu   from '../Menu';
import Game   from '../Game';

import { UserDataContext } from '../../Contexts/UserDataContext';

const App = () => {
  const userData = useContext(UserDataContext);

  const [ isInGame, setIsInGame ] = useState(true);

  console.log(userData);

  return <>
    <Header>
      <h1>BattleShip</h1>
    </Header>
    {
      isInGame
      ?
        <Game />
      :
        <Menu />
    }
  </>;
}

export default App;