import Button from '../Button';

import './Room.css';

const Room = ({
  clickCallback,
  roomName,
}) =>
  <div className="opened-room">
    <p>ID: { roomName }</p>
    <Button onClick={ clickCallback }>Connect</Button>
  </div>;

export default Room;