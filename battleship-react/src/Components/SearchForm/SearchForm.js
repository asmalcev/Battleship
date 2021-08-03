import { useState, useContext } from 'react';

import Button      from '../../features/Button';
import SearchField from '../../features/SearchField';

import {
  localStorageKeys,
  UserDataContext
} from '../../Contexts/UserDataContext';

import { config } from '../../config';

import { ModalContext } from '../../Contexts/ModalContext';

const SearchForm = () => {
  const userData  = useContext(UserDataContext);
  const modalData = useContext(ModalContext);

  const [ request,      setRequest ] = useState('');
  const [ validRequest, setValid   ] = useState(true);

  const updateRequest = (request, valid) => {
    setRequest(request);
    setValid(valid);
  }

  const submitHandler = e => {
    e.preventDefault();
    if (!validRequest) {
      return;
    }

    let jwttoken = localStorage.getItem(localStorageKeys['jwt']); // access token
    fetch(`http://${config.battleshipServer.host}/find`, {
      method: 'POST',
      body: jwttoken == null ? '' : JSON.stringify({
        jwttoken: jwttoken,
        roomId: request,
        userId: userData.userId
      })
    }).then(response => {
      if (response.status === 200) {
        userData.updateRoom(request);
      } else {
        const closeHandler = () => {
          modalData.updateIsShown(false);
        }

        const notFoundMessage = <>
          <h2 className="margined">Nothing has been found :(</h2>
          <Button onClick={ closeHandler }>Close</Button>
        </>;

        modalData.updateContent(notFoundMessage);
        modalData.updateIsShown(true);
      }
    }).catch(err => {
      console.log(err);
    });
  }

  return <form onSubmit={ submitHandler }>
    <SearchField requestChangeCallback={ updateRequest }
                 value={ request }/>
    <Button type="submit">Search room</Button>
  </form>;
}

export default SearchForm;