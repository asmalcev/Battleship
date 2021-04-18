import Room from '../../features/Room';

const OpenedRooms = () => {
  const rooms = [214156, 375105].map(roomid =>
    <Room key           = { roomid }
          roomName      = { roomid }
          clickCallback = { () => console.log(roomid) }/>
  );

  return <>
    <h3 className="headline">Opened rooms</h3>
    {
      rooms
    }
  </>;
}

export default OpenedRooms;