import { useState } from 'react';

import Switcher from '../../features/Switcher';

import { theme as themeConfig } from '../../config';

const ThemeSwitcher = () => {
  const [ theme, setTheme ] = useState('light');

  const changeHandler = theme => {
    setTheme(theme ? 'dark' : 'light');
  }

  for (let prop in themeConfig[theme]) {
    document.documentElement.style.setProperty(`--${prop}`, themeConfig[theme][prop]);
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