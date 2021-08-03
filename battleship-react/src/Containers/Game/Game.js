import {
  useState,
  useRef,
  useContext,
  useEffect
} from 'react';

import GameField from '../../Components/GameField';
import Button    from '../../features/Button';

import { 
  localStorageKeys,
  UserDataContext
} from '../../Contexts/UserDataContext';

import { config } from '../../config';

import './Game.css';

const initialAvaibleShips = [
  { id: 0, name: 'Aircraft Carriers', count: 1 },
  { id: 1, name: 'Missile Cruisers',  count: 2 },
  { id: 2, name: 'Destroyers',        count: 3 },
  { id: 3, name: 'Frigates',          count: 4 }
];

const initialPlayerField = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];

const GameFieldParams = {
  width: 10,
  height: 10
};

const getRect = (x, y, w, h) => {
  let arr = [];
  for (let i = x; i < x + w && i < GameFieldParams.width; i++) {
    if (i < 0) continue;
    for (let j = y; j < y + h && j < GameFieldParams.height; j++) {
      if (j < 0) continue;
      arr.push(i + j * GameFieldParams.width);
    }
  }

  return arr;
}

const copyArrOfObjs = arr => arr.map(obj => Object.assign({}, obj));

const getRandomNumber = (min, max) => {
  return Math.floor(min + Math.random() * (max + 1 - min));
}

const Game = () => {
  const userData = useContext(UserDataContext);

  const socket              = useRef(null);
  const opponentId          = useRef(null);
  const sendMessageToServer = useRef(null);

  const [ gameState, setGameState ] = useState(config.gameStates.notStarted);

  const [ playerField,   setPlayerField   ] = useState(initialPlayerField);
  const [ opponentField, setOpponentField ] = useState(initialPlayerField);

  const [ avaibleToPlaceShips, setAvaibleToPlaceShips ] = useState(copyArrOfObjs(initialAvaibleShips));
  const [ shipToPlace,         setShipToPlace         ] = useState(null);
  const [ playerFieldMask,     setPlayerFieldMask     ] = useState(null);

  const isHorizontalOrigin    = useRef(true);
  const isPossibleToPlaceShip = useRef(false);

  const checkNearestShips = (
    x, y,
    ship = shipToPlace,
    field = playerField
  ) => {
    isPossibleToPlaceShip.current = true;
    if (isHorizontalOrigin.current) {
      const shipCellCount = getRect(x - 1, y - 1, ship.length + 2, 3)
                           .filter(index => field[index] === 1)
                           .length;
      if (shipCellCount > 0) {
        isPossibleToPlaceShip.current = false;
      }
    } else {
      const shipCellCount = getRect(x - 1, y - 1, 3, ship.length + 2)
                           .filter(index => field[index] === 1)
                           .length;
      if (shipCellCount > 0) {
        isPossibleToPlaceShip.current = false;
      }
    }
  }

  const shipChooseHandler = shipId => {
    if (shipToPlace && shipId === shipToPlace.id) {
      setShipToPlace(null);
    } else {
      setShipToPlace({
        id:     shipId,
        length: 4 - shipId
      });
    }
  }

  const rotateOriginHandler = () => {
    isHorizontalOrigin.current = !isHorizontalOrigin.current;
  }

  const randomizeShipPlacement = () => {
    if (avaibleToPlaceShips.length === 0) {
      return;
    }
    let ships = copyArrOfObjs(avaibleToPlaceShips);
    let field = playerField.slice();

    let choosenShip, index, x, y;

    const checkBorders = () => {
      if (isHorizontalOrigin.current) {
        if (
          GameFieldParams.width - x < choosenShip.length
        ) {
          isPossibleToPlaceShip.current = false;
        }
      } else {
        if (
          GameFieldParams.height - y < choosenShip.length
        ) {
          isPossibleToPlaceShip.current = false;
        }
      }
    }

    while (ships.length !== 0) {
      choosenShip = {
        id:     ships[0].id,
        length: 4 - ships[0].id
      };
      index = getRandomNumber(0, field.length - 1);

      x = index % GameFieldParams.width;
      y = Math.floor(index / GameFieldParams.height);

      checkNearestShips(x, y, choosenShip, field);
      checkBorders();
      if (isPossibleToPlaceShip.current) {

        field = applyMask(field, { start: index }, choosenShip);
        ships = ships.map(ship => {
          if (ship.id === choosenShip.id) {
            ship.count--;
          }
          return ship;
        }).filter(ship => ship.count > 0);

      } else {
        rotateOriginHandler();
        checkNearestShips(x, y, choosenShip, field);
        checkBorders();
        if (isPossibleToPlaceShip.current) {

          field = applyMask(field, { start: index }, choosenShip);
          ships = ships.map(ship => {
            if (ship.id === choosenShip.id) {
              ship.count--;
            }
            return ship;
          }).filter(ship => ship.count > 0);
        }
      }
    }

    setPlayerField(field);
    setAvaibleToPlaceShips(ships);
    setShipToPlace(null);
    setPlayerFieldMask(null);
  }

  const clearField = () => {
    setPlayerField(initialPlayerField);
    setAvaibleToPlaceShips(copyArrOfObjs(initialAvaibleShips));
    setShipToPlace(null);
    setPlayerFieldMask(null);
  }

  const shipsList = avaibleToPlaceShips.map(ship =>
    <li key       = {`${ship.id}-${ship.count}`}
        onClick   = { shipChooseHandler.bind(null, ship.id) }
        className = { shipToPlace && shipToPlace.id === ship.id ? 'active' : '' }>
      { ship.name } { ship.count > 1 ? `x${ship.count}` : '' }
    </li>
  );

  const leftPanel = <div className="game-panel">
    <h3>Avaible ships</h3>
    <ul>
      { shipsList }
    </ul>
    <div className="btn-container">
      {
        avaibleToPlaceShips.length > 0
        ?
          <>
            <Button onClick = { rotateOriginHandler    }>Rotate ship</Button>
            <Button onClick = { randomizeShipPlacement }>Randomize</Button>
          </>
        :
          <Button onClick = { null }>Ready</Button>
      }
      <Button onClick = { clearField }>Reset</Button>
    </div>
  </div>;

  const rightPanel = <div className="game-panel">
    <h3>Battle stats</h3>
  </div>;

  const playerFieldClickHandler = (target, e) => {
    e.preventDefault();

    if (!isPossibleToPlaceShip.current) {
      return;
    }

    setPlayerField(applyMask(playerField.slice(), playerFieldMask));

    let isShipCountEqZero = false;
    setAvaibleToPlaceShips(avaibleToPlaceShips.map(ship => {
      if (ship.id === shipToPlace.id) {
        ship.count--;
        if (ship.count === 0) {
          isShipCountEqZero = true;
        }
      }
      return ship;
    }).filter(ship => ship.count > 0));

    if (!e.shiftKey || isShipCountEqZero) {
      setShipToPlace(null);
    }
    isPossibleToPlaceShip.current = false;
  }

  const applyMask = (field, mask, ship = shipToPlace) => {
    if (!mask || !isPossibleToPlaceShip.current) return field;
  
    for (
      let i = mask.start, jlen = 0;
      jlen < ship.length;
      jlen++, i += isHorizontalOrigin.current ? 1 : GameFieldParams.width
    ) {
      field[i] = 1;
    }

    return field;
  }

  const overCellHandler = target => {
    const x = target.index % GameFieldParams.width;
    const y = Math.floor(target.index / GameFieldParams.height);

    checkNearestShips(x, y);
    if (isHorizontalOrigin.current) {
      if (
        GameFieldParams.width - x < shipToPlace.length
      ) {
        isPossibleToPlaceShip.current = false;
      }
    } else {
      if (
        GameFieldParams.height - y < shipToPlace.length
      ) {
        isPossibleToPlaceShip.current = false;
      }
    }
    setPlayerFieldMask({
      start: target.index
    });
  }

  const clearMask = () => {
    setPlayerFieldMask(null);
  }

  const deleteHandler = e => {
    e.preventDefault();

    if (sendMessageToServer.current === null) return;

    let jwttoken = localStorage.getItem(localStorageKeys['jwt']); // access token
    fetch(`http://${config.battleshipServer.host}/delete`, {
      method: 'POST',
      body: jwttoken == null ? '' : JSON.stringify({
        jwttoken: jwttoken,
        roomId: userData.roomId,
        userId: userData.userId
      })
    }).then(response => response.text())
      .then(data => {
        console.log(data);
        userData.updateRoom(null);
        sendMessageToServer.current({ type: 'notifyOpponent' })

    }).catch(err => {
      console.log(err);
    });
  }

  /*
   *
   *  WEBSOCKET
   *
  */
  useEffect(() => {
    socket.current = new WebSocket(`ws://${config.battleshipServer.host}/game/${userData.roomId}`);

    sendMessageToServer.current = msg => {
      socket.current.send(JSON.stringify(msg));
    }

    socket.current.onopen = event => {
      console.log('ok', 'Connection established');
    
      const msg = {
        type     : 'initial',
        playerID : userData.userId
      };

      sendMessageToServer.current(msg);
    }

    socket.current.onclose = event => {
      console.log('bad', 'Connection lost');
    }

    socket.current.onerror = error => {
      console.error(`[WebSocket error] ${error.message}`)
    }

    socket.current.onmessage = event => {
      const response = JSON.parse(event.data);

      console.log(response);

      if (response.type === 'modelChange') {
        if (response.opponent != 'None' && opponentId.current == null) {
          opponentId.current = response.opponent;
          setGameState(config.gameStates.started);
          console.log('opponent connected', 'game started');
        } else if (
          (response.opponent === 'None' || response.opponent === '0') &&
          opponentId.current !== undefined
        ) {
          opponentId.current = null;
          setGameState(config.gameStates.notStarted);
          console.log('opponent disconnected', 'game not started');
        }
      } else if (response.type === 'step') {

      } else if (response.type === 'initial') {
        
      } else if (response.type === 'warning') {
        
      } else if (response.type === 'theend') {
        
      }
    }

  }, []);

  return <><h2 onClick={ deleteHandler } style={{backgroundColor: '#3335'}}>leave</h2>
  <div className="game-container">
    {
      leftPanel
    }
    
    <GameField field = {
                shipToPlace
                  ?
                    applyMask(playerField.slice(), playerFieldMask)
                  :
                    playerField 
               }
               label      = "Player Field"
               onClick    = { shipToPlace && playerFieldClickHandler }
               onOverCell = { shipToPlace && overCellHandler }
               onOutField = { shipToPlace && clearMask } />
    
    <GameField field   = { opponentField }
               label   = "Opponent Field" />
    
    {
      rightPanel
    }
    {
      gameState === config.gameStates.notStarted &&
      <div className="noise-block-mask">
        <h2>Waiting for the opponent</h2>
      </div>
    }
  </div></>;
}

export default Game;