import { useState } from 'react';

import Button      from '../../features/Button';
import SearchField from '../../features/SearchField';

import './SearchForm.css';

const SearchForm = () => {
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

    alert(`Searching for room ${request}`);
  }

  return <form onSubmit={ submitHandler }>
    <SearchField requestChangeCallback={ updateRequest }/>
    <Button type="submit">Search room</Button>
  </form>;
}

export default SearchForm;