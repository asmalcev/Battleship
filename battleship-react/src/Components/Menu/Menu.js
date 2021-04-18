import Tabs        from '../Tabs';
import SearchForm  from '../SearchForm';
import OpenedRooms from '../OpenedRooms'; 
import CreateForm  from '../CreateForm';

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
          tabcontent : <div>Settings</div>
        },
      ]}
    </Tabs>
  </div>;
}

export default Menu;