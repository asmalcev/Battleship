import Tabs        from '../../Components/Tabs';
import Settings    from '../../Components/Settings';
import SearchForm  from '../../Components/SearchForm';
import CreateForm  from '../../Components/CreateForm';
import OpenedRooms from '../../Components/OpenedRooms'; 

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