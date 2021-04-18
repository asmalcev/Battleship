import './Checkbox.css';

const Checkbox = ({
  id,
  children,
  ...other
}) =>
  <div className="checkbox-container">
    <input type = "checkbox"
           id   = { id }
           {...other}/>
    {
      children && id &&
      <label htmlFor={ id }>{ children }</label>
    }
  </div>;

export default Checkbox;