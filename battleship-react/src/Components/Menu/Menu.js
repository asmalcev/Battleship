// import { useState } from 'react';
import SearchField from '../SearchField';
import Tabs        from '../Tabs';

import './Menu.css';

const Menu = () => {

  return <div className="menu-container">
    <Tabs>
      {[
        {
          tabname    : 'Search',
          tabcontent : <>
            <SearchField />
            <p><br/>other info...</p>
          </>
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