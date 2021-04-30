import { useState } from 'react';

import Header from '../Header';
import Menu   from '../Menu';
import Game   from '../Game';

const App = () => {
  const [ isInGame, setIsInGame ] = useState(true);

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