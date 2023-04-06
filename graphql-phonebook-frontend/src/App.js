import { useQuery } from '@apollo/client'
import { useState } from 'react'

import Persons from './components/Persons'
import PersonForm from './components/PersonForm'

import { ALL_PERSONS } from './queries'
import PhoneForm from './components/PhoneForm'

const Notify = ({ errorMessage }) => {
  if(!errorMessage) {
    return null
  }

  return (
    <div style={{color: 'red'}}>
      {errorMessage}
    </div>  
  )
}

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null);

  const query_result = useQuery(ALL_PERSONS)

  if (query_result.loading) {
    return <div>loading...</div>
  }

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  return (
    <div>
      <Notify errorMessage={errorMessage}/>
      <PersonForm setError={notify} />
      <PhoneForm setError={notify}/>
      <Persons persons={query_result.data.allPersons} />
    </div>
  )
}



export default App
