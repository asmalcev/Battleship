import { useContext } from 'react';

import Switcher from '../../features/Switcher';
import { UserDataContext } from '../../Contexts/UserDataContext';

const ThemeSwitcher = () => {
  const userContext = useContext(UserDataContext);
  const theme       = userContext.theme;

  const changeHandler = theme => {
    userContext.updateTheme(theme ? 'dark' : 'light');
  }

  return <>
    <h3>Theme</h3>
    <Switcher label1   = "Light"
              label2   = "Dark"
              id       = "theme-selector"
              state    = { theme === 'dark' }
              onChange = { changeHandler }/>
  </>;
}

export default ThemeSwitcher;