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

import { ModalContext } from '../../Contexts/ModalContext';

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

const indexToXY = index => ({
  x: index % GameFieldParams.width,
  y: Math.floor(index / GameFieldParams.width)
});

const XYToIndex = ({x, y}) => y * GameFieldParams.width + x;

const getAllIndexes = (arr, val) => {
  let indexes = [], i = -1;
  while ((i = arr.indexOf(val, i + 1)) != -1) {
    indexes.push(i);
  }
  return indexes;
}

const blockCells = field => {
  getAllIndexes(field, 4).forEach(index => {
    const { x, y } = indexToXY(index);
    getRect(x - 1, y - 1, 3, 3).forEach(coords => {
      if (field[coords] === 0) {
        field[coords] = 5;
      }
    })
  });

  return field;
}

const Game = () => {
  const userData  = useContext(UserDataContext);
  const modalData = useContext(ModalContext);

  const socket                    = useRef(null);
  const opponentId                = useRef(null);
  const sendMessageToServer       = useRef(null);
  const waintingForResponseToStep = useRef(false);

  const [ gameState,   setGameState   ] = useState(config.gameStates.notStarted);
  const [ playerState, setPlayerState ] = useState(1);

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

  const readyHandler = e => {
    e.preventDefault();
    if (sendMessageToServer.current === null) return;
    sendMessageToServer.current({
      type: 'field',
      data: playerField.join('')
    });
  }

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
          <Button onClick = { readyHandler }>Ready</Button>
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

  const deleteHandler = (_, shouldNotifyOpponent = true) => {
    if (sendMessageToServer.current === null && !shouldNotifyOpponent) return;

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
        // console.log(data);
        userData.updateRoom(null);
        shouldNotifyOpponent && sendMessageToServer.current({ type: 'notifyOpponent' });

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
  }, [userData.roomId]);

  useEffect(() => {
    socket.current.onopen = event => {
      console.log('ok', 'Connection established');
      sendMessageToServer.current({
        type     : 'initial',
        playerID : userData.userId
      });
    }

    socket.current.onclose = event => {
      console.log('bad', 'Connection lost');
    }

    socket.current.onerror = error => {
      console.error(`[WebSocket error] ${error.message}`)
    }

    socket.current.onmessage = event => {
      const response = JSON.parse(event.data);
      /*
       *
       * MODEL CHANGE MSG RESPONSE
       *
      */
      if (response.type === 'modelChange') {
        if (response.opponent != 'None' && opponentId.current == null) {
          opponentId.current = response.opponent;
          setGameState(config.gameStates.started);

          const closeHandler = () => {
            modalData.updateIsShown(false);
          }

          const modalContent = <>
            <h2 className="margined">Opponent in the room</h2>
            <p>opponent_id: { opponentId.current }</p>
            <Button onClick={ closeHandler }>Ok</Button>
          </>;

          modalData.updateContent(modalContent);
          modalData.updateIsShown(true);
        } else if (
          (response.opponent === 'None' || response.opponent === '0') &&
          opponentId.current !== null
        ) {
          opponentId.current = null;
          setGameState(config.gameStates.notStarted);

          const closeHandler = () => {
            modalData.updateIsShown(false);
          }

          const modalContent = <>
            <h2 className="margined">Opponent disconnected</h2>
            <Button onClick={ closeHandler }>Ok :(</Button>
          </>;

          modalData.updateContent(modalContent);
          modalData.updateIsShown(true);
        }
        if (response.playerState !== playerState) {
          setPlayerState(response.playerState);
        }
        if (response.diff !== undefined) {
          const tmpField = playerField.slice();
          response.diff.forEach(diffCell => {
            tmpField[+diffCell[1]] = +diffCell[0];
          });
          setPlayerField(blockCells(tmpField));
        }
      /*
       *
       * STEP MSG RESPONSE
       *
      */
      } else if (response.type === 'step') {
        waintingForResponseToStep.current = false;
        const tmpField = opponentField.slice();
        response.coords.forEach(coord => {
          tmpField[XYToIndex(coord)] = +response.classCode;
        });
        setOpponentField(blockCells(tmpField));

      /*
       *
       * INITIAL MSG RESPONSE
       *
      */
      } else if (response.type === 'initial') {
        setPlayerField(
          blockCells( response.playerField.split('').map(cell => +cell) )
        );
        setOpponentField(
          blockCells( response.opponentField.split('').map(cell => +cell) )
        );

      /*
       *
       * WARNING MSG RESPONSE
       *
      */
      } else if (response.type === 'warning') {
        switch(response.code) {
          case 1: // room has been deleted
            console.log('bad', 'Connection lost');
            if (userData.isHost.current === false) {
              const closeHandler = () => {
                modalData.updateIsShown(false);
                deleteHandler(null, false);
              }

              const modalContent = <>
                <h2 className="margined">Seems like host leaved the room and it has been deleted</h2>
                <Button onClick={ closeHandler }>Return to menu</Button>
              </>;

              modalData.updateContent(modalContent);
              modalData.updateIsShown(true);
            } else {
              userData.isHost.current = false;
            }
            break;
        }

      /*
       *
       * GOT MSG ABOUT WIN / LOSE
       *
      */
      } else if (response.type === 'theend') {
        let title;
        if (response.result === 'won') {
          title = 'Congratulations, you won!';
        } else {
          title = 'Unfortunately you lost :(';
        }

        const closeHandler = () => {
          modalData.updateIsShown(false);
        }

        const closeAndQuitHandler = () => {
          modalData.updateIsShown(false);
          deleteHandler(null, false);
        }

        const modalContent = <>
          <h2 className="margined">{ title }</h2>
          <Button onClick={ closeHandler }>Ok</Button>
          <Button onClick={ closeAndQuitHandler }>Return to menu</Button>
        </>;

        modalData.updateContent(modalContent);
        modalData.updateIsShown(true);
      }
    }

  }, [opponentField, playerField, playerState, userData.userId]);

  const opponentFieldClickHandler = (target, e) => {
    if (
      !waintingForResponseToStep.current &&
      playerState == config.userStates.turnToGo &&
      target.html.classList.contains('empty')
    ) {
      waintingForResponseToStep.current = true;
      sendMessageToServer.current({
        type: 'step',
        data: indexToXY(target.index)
      });
    }
  }

  return <><h2 onClick={ deleteHandler } style={{backgroundColor: '#3335'}}>leave</h2>
  <div className="game-container">
    {
      playerState < config.userStates.readyToPlay && leftPanel
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
    
    <GameField onClick = { opponentFieldClickHandler }
               field   = { opponentField }
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