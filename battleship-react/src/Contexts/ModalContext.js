import { useState, createContext } from 'react';

export const ModalContext = createContext({
  isShown       : false,
  content       : <></>,
  updateIsShown : () => null,
  updateContent : () => null
});

export const ModalContextProvider = props => {
  const contextObj = {};

  const [ isShown, setIsShown ] = useState(false);
  const [ content, setContent ] = useState(false);

  contextObj.isShown       = isShown;
  contextObj.updateIsShown = state => {
    setIsShown(state);
  };

  contextObj.content       = content;
  contextObj.updateContent = newContent => {
    setContent(newContent);
  };

  return <ModalContext.Provider value={ contextObj } {...props}/>;
}