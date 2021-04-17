import { useState } from 'react';
import Tabs         from '../Tabs';

import './Menu.css';

const Menu = () => {

  return <div className="menu-container">
    <Tabs>
      {[
        {
          tabname    : 'Search',
          tabcontent : <div>Search</div>
        },
        {
          tabname    : 'Create',
          tabcontent : <div>Create <br/><br/><br/></div>
        },
        {
          tabname    : 'Settings',
          tabcontent : <div>Settings</div>
        },
      ]}
    </Tabs>
  </div>;
}

export default Menu;