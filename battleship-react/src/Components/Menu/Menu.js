import Tabs        from '../Tabs';
import Settings    from '../Settings';
import SearchForm  from '../SearchForm';
import CreateForm  from '../CreateForm';
import OpenedRooms from '../OpenedRooms'; 

import './Menu.css';

const Menu = () => {

  return <div className="menu-container">
    <Tabs>
      {[
        {
          tabname    : 'Search',
          tabcontent : <>
            <SearchForm />
            <OpenedRooms />
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