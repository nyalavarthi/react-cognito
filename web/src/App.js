import React, { useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import NavMenu from './components/nav/menu'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import CognitoAuthService from './services/cognitoService'
import apiConfig from './config/app-config.json'


const service = new CognitoAuthService()

function App() {
  const [userData, setUserData] = React.useState({});

  useEffect(() => {
    service.getCurrentUser().then((result) => {
      console.log('user from session ', result)
      if (result) {
        console.log('attributes : ', result.attributes)
        console.log('result.attributes.email ', result.attributes.given_name)
        //setUser({ name: result.attributes.email, groups: result.attributes['custom:groups'], loggedIn: true })
        setUserData(result)
      }
      callChildFn(result);
    })
  }, []);


  const childFnRef = useRef(null);
  const callChildFn = (result) => {
    if (childFnRef?.current) {
      console.log(result)
      if (result) {
        childFnRef.current(result.attributes.given_name, result.attributes.family_name,
          result.attributes.email,
          result.attributes['custom:groups']);
      } else {
        childFnRef.current('', '', '');
      }
    }
  }


  return (
    <div className="App">

      <div >
        <NavMenu ref={childFnRef}
          f_name={userData.attributes ? userData.attributes.given_name : ''}
          l_name={userData.attributes ? userData.attributes.family_name : ''}
          role={userData.groups}
        />
      </div>

      <header className="App-header">
        <p>
          Welcome to Sample ReactJS and Cognito application
        </p>
        {!userData.attributes ?
        <a
          className="App-link"
          href={apiConfig.LoginURL}
          //target="_blank"
          rel="noopener noreferrer"
        >
          Login
        </a>
      : '' }
      </header>
    </div>
  );
}

export default App;
