import Cell from './Cell';

import './GameField.css';

const GameField = ({
  label,
  field,
  onClick,
  onOverCell,
  onOutField
}) => {

  const cellMouseoverHandler = (index, e) => {
    onOverCell({
      html: e.target,
      index: index
    }, e);
  }

  const fieldMouseoutHandler = () => {
    onOutField();
  }

  const cells = field.map((cell, i) =>
    <Cell value       = { cell }
          key         = { i }
          index       = { i }
          onMouseOver = { onOverCell && cellMouseoverHandler.bind(null, i) } />
  );

  const clickHandler = e => {
    if (!e.target.classList.contains('game-field-cell')) {
      return;
    }

    onClick && onClick({
      html: e.target,
      index: e.target.dataset.index
    }, e);
  }

  return <div className="game-field-container">
    {
      label && <h3>{ label }</h3>
    }
    <div className  = "game-field"
         onClick    = { clickHandler }
         onMouseOut = { onOutField && fieldMouseoutHandler }>
      { cells }
    </div>
  </div>;
}

export default GameField;