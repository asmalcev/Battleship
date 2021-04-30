import Cell from './Cell';

import './GameField.css';

const GameField = ({
  label,
  field
}) => {

  const cells = field.map((cell, i) =>
    <Cell value={ cell }
          key={`${i}-${cell}`}
          index={ i } />
  );

  const clickHandler = e => {
    if (!e.target.classList.contains('game-field-cell')) {
      return;
    }
    const cellTarget = {
      html: e.target,
      index: e.target.dataset.index
    }
    console.log(cellTarget);
  }

  return <div className="game-field-container">
    {
      label && <h3>{ label }</h3>
    }
    <div className="game-field" onClick={ clickHandler }>
      { cells }
    </div>
  </div>;
}

export default GameField;