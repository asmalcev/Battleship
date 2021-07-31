import { useState, useContext } from 'react';

import Button   from '../../features/Button';
import Checkbox from '../../features/Checkbox';

import {
  localStorageKeys,
  UserDataContext
} from '../../Contexts/UserDataContext';

const CreateForm = () => {
  const userData = useContext(UserDataContext);

  const [ isOpen, setOpen ] = useState(false);

  const changeOpenHanlder = () => setOpen(!isOpen);

  const submitHandler = e => {
    e.preventDefault();

    let jwttoken = localStorage.getItem(localStorageKeys['jwt']); // access token
    fetch('http://localhost:8000/create', {
      method: 'POST',
      body: jwttoken == null ? '' : JSON.stringify({
        jwttoken: jwttoken,
        isOpen: isOpen
      })
    }).then(response => response.text())
      .then(data => {
      userData.updateRoom(+data);

    }).catch(err => {
      console.log(err);
    });
  }

  return <form onSubmit={ submitHandler }>
    <Checkbox id       = "is-opened"
              checked  = { isOpen }
              onChange = { changeOpenHanlder }>Create an opened room</Checkbox>
    <Button type="submit">Create room</Button>
  </form>;
}

export default CreateForm;