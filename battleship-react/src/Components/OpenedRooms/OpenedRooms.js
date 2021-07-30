import Room from '../../features/Room';

import './OpenedRooms.css';

const OpenedRooms = ({
  rooms,
  reload
}) => {

  const clickHandler = (roomid) => {
    console.log(roomid);
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