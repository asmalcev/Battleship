const detectCellClass = classId => {
  if (classId === 1) return 'shit';
  if (classId === 2) return 'miss';
  if (classId === 3) return 'destroyed-ship';
  if (classId === 4) return 'hit';
  if (classId === 5) return 'blocked';

  return 'empty';
}

const Cell = ({
  index,
  value
}) =>
  <div className={`game-field-cell ${detectCellClass(value)}`} data-index={ index } />;

export default Cell;