import { useState } from 'react';

import './Tabs.css';

const Tabs = ({children}) => {
  const [ activeTab, setActiveTab ] = useState(0);

  const changeTab = index => {
    setActiveTab(index);
  }

  return <div className="tabs-container">
    <div className="tabs">
      {
        children.map((tab, i) =>
          <button className = {`tablinks${ i == activeTab ? " active" : ""}`}
                  onClick   = { changeTab.bind(null, i) }
                  key       = { i }
          >{ tab.tabname }</button>
        )
      }
    </div>
    <div className="tab">
      {
        children.filter((tab, i) => i === activeTab)[0].tabcontent
      }
    </div>
  </div>;
}

export default Tabs;