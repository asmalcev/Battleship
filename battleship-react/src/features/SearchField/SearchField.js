import { useState } from 'react';
import InputField   from '../InputField';

import './SearchField.css';

const SearchField = ({
  requestChangeCallback
}) => {
  const idLength = 6;

  const [ progress, setProgress ] = useState(0);

  const searchValidator = value => value.search(/[^\d]/) === - 1;

  const changeCallback = (value, valid) => {
    if (!valid) {
      setProgress(-1);
    } else {
      setProgress(value.length);
    }
    requestChangeCallback(value, valid);
  }

  return <div className={`search-container${progress !== -1 ? ' valid' : ''}`}>
    <InputField
      id           = "room-id"
      name         = "search"
      placeholder  = "Room ID"
      autoComplete = "off"
      minLength    = { idLength }
      maxLength    = { idLength }
      errMsg       = "Field should contain only numbers"

      validator      = { searchValidator }
      changeCallback = { changeCallback }
      required/>
    {
      progress !== -1 &&
      <div className="progress-bar" style={{ width:`${progress / idLength * 100}%` }}/>
    }
  </div>;
}

export default SearchField;