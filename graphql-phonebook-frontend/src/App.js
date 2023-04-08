import { useApolloClient, useQuery, useSubscription } from '@apollo/client'
import { useState, useEffect } from 'react'

import { ALL_PERSONS, PERSON_ADDED } from './queries'

import Persons from './components/Persons'
import PersonForm from './components/PersonForm'
import PhoneForm from './components/PhoneForm'
import LoginForm from './components/LoginForm'

const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null
  }

  return <div style={{ color: 'red' }}>{errorMessage}</div>
}

// function that takes care of manipulating cache
export const updateCache = (cache, query, addedPerson) => {
  // helper that is used to eliminate saving same person twice
  const uniqByName = (a) => {
    let seen = new Set()
    return a.filter((item) => {
      let k = item.name
      return seen.has(k) ? false : seen.add(k)
    })
  }

  cache.updateQuery(query, ({ allPersons }) => {
    return {
      allPersons: uniqByName(allPersons.concat(addedPerson))
    }
  })  
}

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [token, setToken] = useState(null)

  const result = useQuery(ALL_PERSONS)

  const client = useApolloClient()
  
  useEffect(() => {
    setToken(localStorage.getItem('phonenumbers-user-token'))
  }, [])


  useSubscription(PERSON_ADDED, {
    onData: ({ data }) => {
      console.log(data);
      const addedPerson = data.data.personAdded
      notify(`${addedPerson.name} added`)

      updateCache(client.cache, { query: ALL_PERSONS }, addedPerson)
    }
  })

  if (result.loading) {
    return <div>loading...</div>
  }

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  if (!token) {
    return (
      <>
        <Notify errorMessage={errorMessage} />
        <LoginForm setToken={setToken} setError={notify} />
      </>
    )
  }

  return (
    <div>
      <Notify errorMessage={errorMessage} />
      <button onClick={logout}>logout</button>
      <PersonForm setError={notify} />
      <PhoneForm setError={notify} />
      <Persons persons={result.data.allPersons} />
    </div>
  )
}

export default App
