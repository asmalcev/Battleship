import { useContext } from 'react';

import Room from '../../features/Room';

import './OpenedRooms.css';

import {
  localStorageKeys,
  UserDataContext
} from '../../Contexts/UserDataContext';

import { config } from '../../config';

const OpenedRooms = ({
  rooms,
  reload
}) => {
  const userData = useContext(UserDataContext);

  const clickHandler = (roomId) => {
    let jwttoken = localStorage.getItem(localStorageKeys['jwt']); // access token
    fetch(`http://${config.battleshipServer.host}/connect`, {
      method: 'POST',
      body: jwttoken == null ? '' : JSON.stringify({
        jwttoken: jwttoken,
        roomId: roomId,
        userId: userData.userId
      })
    }).then(response => response.text())
      .then(data => {
        console.log(data);
        userData.updateRoom(roomId);

    }).catch(err => {
      console.log(err);
    });
  }

  const reloadHandler = () => {
    reload();
  }

  return <>
    <h3 className="headline opened-rooms">
      Open rooms
      <button className="reload" onClick={ reloadHandler }>reload</button>
    </h3>
    {
      rooms.length === 0
      ?
      <p>No open rooms</p>
      :
      rooms.map(roomid =>
        <Room key           = { roomid }
              roomName      = { roomid }
              clickCallback = { clickHandler.bind(null, roomid) }/>
      )
    }
  </>;
}

export default OpenedRooms;