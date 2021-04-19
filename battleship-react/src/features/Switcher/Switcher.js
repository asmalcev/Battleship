import './Switcher.css';

const Switcher = ({
  id,
  state,
  label1,
  label2,
  onChange
}) => {

  const clickHandler = newState => {
    onChange(newState);
  }

  return <div className="switcher-container">
    {
      label1 &&
      <span className = "label-text"
            onClick   = { clickHandler.bind(null, false) }>{ label1 }</span>
    }
    <input type     = "checkbox"
           id       = { id }
           checked  = { state }
           onChange = { clickHandler.bind(null, !state) }/>
    <label htmlFor={ id }></label>
    {
      label2 &&
      <span className = "label-text"
            onClick   = { clickHandler.bind(null, true) }>{ label2 }</span>
    }
  </div>;
}

export default Switcher;