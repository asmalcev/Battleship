import { useState, useEffect } from 'react';

import Tabs        from '../../Components/Tabs';
import Settings    from '../../Components/Settings';
import SearchForm  from '../../Components/SearchForm';
import CreateForm  from '../../Components/CreateForm';
import OpenedRooms from '../../Components/OpenedRooms';

import { localStorageKeys } from '../../Contexts/UserDataContext';

import './Menu.css';

const Menu = () => {
  const [ rooms, setRooms ] = useState([]);

  const loadOpenedRooms = () => {
    const jwttoken = localStorage.getItem(localStorageKeys['jwt']); // access token
    if (jwttoken == null) return 0;
    console.log('loading opened rooms');

    fetch('http://localhost:8000/get-opened-rooms', {
      method: 'POST',
      body: jwttoken == null ? '' : JSON.stringify({
        jwttoken: jwttoken
      })
    }).then(response => response.json())
      .then(data => setRooms(data))
      .catch(err => {
      console.log(err);
    });
  }

  useEffect(loadOpenedRooms, []);

  return <div className="menu-container">
    <Tabs>
      {[
        {
          tabname    : 'Search',
          tabcontent : <>
            <SearchForm />
            <OpenedRooms
              rooms  = { rooms }
              reload = { loadOpenedRooms }
            />
          </>
        },
        {
          tabname    : 'Create',
          tabcontent : <>
            <CreateForm />
          </>
        },
        {
          tabname    : 'Settings',
          tabcontent : <>
            <Settings />
          </>
        },
      ]}
    </Tabs>
  </div>;
}

export default Menu;