import Tabs       from '../Tabs';
import SearchForm from '../SearchForm';

import './Menu.css';

const Menu = () => {

  return <div className="menu-container">
    <Tabs>
      {[
        {
          tabname    : 'Search',
          tabcontent : <>
            <SearchForm />
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