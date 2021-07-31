import { useContext } from 'react';

import Room from '../../features/Room';

import './OpenedRooms.css';

import {
  localStorageKeys,
  UserDataContext
} from '../../Contexts/UserDataContext';

const OpenedRooms = ({
  rooms,
  reload
}) => {
  const userData = useContext(UserDataContext);

  const clickHandler = (roomId) => {
    let jwttoken = localStorage.getItem(localStorageKeys['jwt']); // access token
    fetch('http://localhost:8000/connect', {
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
      Opened rooms
      <div className="reload-circle" onClick={ reloadHandler }>reload</div>
    </h3>
    {
      rooms.map(roomid =>
        <Room key           = { roomid }
              roomName      = { roomid }
              clickCallback = { clickHandler.bind(null, roomid) }/>
      )
    }
  </>;
}

export default OpenedRooms;