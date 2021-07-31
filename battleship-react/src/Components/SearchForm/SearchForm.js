import { useState, useContext } from 'react';

import Button      from '../../features/Button';
import SearchField from '../../features/SearchField';

import {
  localStorageKeys,
  UserDataContext
} from '../../Contexts/UserDataContext';

const SearchForm = () => {
  const userData = useContext(UserDataContext);

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
    fetch('http://localhost:8000/find', {
      method: 'POST',
      body: jwttoken == null ? '' : JSON.stringify({
        jwttoken: jwttoken,
        roomId: request,
        userId: userData.userId
      })
    }).then(response => response.text())
      .then(data => {
        console.log(data);
        userData.updateRoom(request);

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