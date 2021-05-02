import { useState, useRef } from 'react';

import GameField from '../../Components/GameField';
import Button    from '../../features/Button';

import './Game.css';

const initialAvaibleShips = [
  { id: 0, name: 'Aircraft Carriers', count: 1 },
  { id: 1, name: 'Missile Cruisers',  count: 2 },
  { id: 2, name: 'Destroyers',        count: 3 },
  { id: 3, name: 'Frigates',          count: 4 }
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

const Game = () => {

  const [ playerField, setPlayerField ] = useState([
    0, 0, 1, 1, 2, 2, 3, 3, 4, 4,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ]);

  const [ avaibleToPlaceShips, setAvaibleToPlaceShips ] = useState(initialAvaibleShips);
  const [ shipToPlace,         setShipToPlace         ] = useState(null);
  const [ playerFieldMask,     setPlayerFieldMask     ] = useState(null);

  const isVerticalOrigin      = useRef(true);
  const isPossibleToPlaceShip = useRef(true);

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
    isVerticalOrigin.current = !isVerticalOrigin.current;
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
      <Button onClick={ rotateOriginHandler }>Rotate ship</Button>
      <Button>Randomize</Button>
    </div>
  </div>;

  const rightPanel = <div className="game-panel">
    <h3>Battle stats</h3>
  </div>;

  const playerFieldClickHandler = target => {
    console.log(target);
  }

  const checkNearestShips = index => {
    const x = index % GameFieldParams.width;
    const y = Math.floor(index / GameFieldParams.height);

    isPossibleToPlaceShip.current = true;
    if (isVerticalOrigin.current) {
      getRect(x - 1, y - 1, 3, shipToPlace.length + 2).forEach(index => {
        if (playerField[index] === 1) {
          isPossibleToPlaceShip.current = false;
        }
      })
    } else {
      getRect(x - 1, y - 1, shipToPlace.length + 2, 3).forEach(index => {
        if (playerField[index] === 1) {
          isPossibleToPlaceShip.current = false;
        }
      })
    }
  }

  const applyMask = (field, mask) => {
    if (!mask) return field;
  
    for (
      let i = mask.start, jlen = 0;
      jlen < shipToPlace.length;
      jlen++, i += isVerticalOrigin.current ? 1 : GameFieldParams.width
    ) {
      field[i] = 1;
    }

    return field;
  }

  const overCellHandler = target => {
    setPlayerFieldMask({
      start:  target.index
    });
  }

  const clearMask = () => {
    setPlayerFieldMask(null);
  }

  return <div className="game-container">
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
               onClick    = { playerFieldClickHandler }
               onOverCell = { shipToPlace && overCellHandler }
               onOutField = { shipToPlace && clearMask } />
    
    <GameField field   = { playerField }
               label   = "Opponent Field" />
    
    {
      rightPanel
    }
  </ div>;
}

export default Game;