import { useState } from 'react';

import Button   from '../../features/Button';
import Checkbox from '../../features/Checkbox';

const CreateForm = () => {
  const [ isOpen, setOpen ] = useState(false);

  const changeOpenHanlder = () => setOpen(!isOpen);

  const submitHandler = e => {
    e.preventDefault();

    alert(`Create ${ isOpen ? 'opened' : 'closed'} room`);
  }

  return <form onSubmit={ submitHandler }>
    <Checkbox id       = "is-opened"
              checked  = { isOpen }
              onChange = { changeOpenHanlder }>Create an opened room</Checkbox>
    <Button type="submit">Create room</Button>
  </form>;
}

export default CreateForm;