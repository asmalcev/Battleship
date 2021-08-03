import { useContext } from 'react';

import Header from '../Header';
import Menu   from '../Menu';
import Game   from '../Game';
import Modal  from '../../Components/Modal/Modal';

import {
  localStorageKeys,
  UserDataContext
} from '../../Contexts/UserDataContext';

const App = () => {
  const userData = useContext(UserDataContext);

  return <>
    <Header>
      <h1>BattleShip</h1>
      { userData.roomId || 'null' }<br/>
      { userData.userId }<br/>
    </Header>
    {
      !!userData.roomId
      ?
        <Game />
      :
        <Menu />
    }
    <Modal />
  </>;
}

export default App;