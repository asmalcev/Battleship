import { useState } from 'react';

import Button   from '../../features/Button';
import Checkbox from '../../features/Checkbox';

import './CreateForm.css';

const CreateForm = () => {
  const [ isOpen, setOpen ] = useState(false);

  const changeOpenHanlder = state => setOpen(state);

  const submitHandler = e => {
    e.preventDefault();

    
  }

  return <form onSubmit={ submitHandler }>
    <Checkbox id="is-opened">Create an opened room</Checkbox>
    <Button type="submit">Create room</Button>
  </form>;
}

export default CreateForm;