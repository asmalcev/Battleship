import { useState } from 'react';

import './InputField.css';

const InputField = ({
  id,
  errMsg,
  validator,
  value = '',
  placeholder,
  changeCallback,
  ...other
}) => {
  const [ isValid, setValid ] = useState(true);

  const changeHandler = e => {
    const newValue = e.target.value;

    let localIsValid = true;
    if (validator) {
      localIsValid = newValue === '' || validator(newValue);
      setValid(localIsValid);
    }

    if (changeCallback) {
      changeCallback(newValue, localIsValid);
    }
  }

  return <div className="field-container">
    <input id          = { id }
           placeholder = { placeholder }
           onChange    = { changeHandler }
           value       = { value }
           {...other}/>
    {
      placeholder && id &&
      <label htmlFor={ id } className="placeholder">{ placeholder }</label>
    }
    {
      errMsg && !isValid &&
      <p className="err-msg">{ errMsg }</p>
    }
  </div>;
}

export default InputField;