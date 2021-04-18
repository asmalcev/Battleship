import './Button.css';

const Button = ({
  ...other
}) =>
  <button className="styled-btn"
          {...other}/>;

export default Button;