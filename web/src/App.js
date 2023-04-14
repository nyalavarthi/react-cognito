import React, { useEffect, useRef } from 'react';
import './App.css';
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import Button from "@cloudscape-design/components/button";
import NavMenu from './components/nav/menu'
import CognitoAuthService from './services/cognitoService'
import apiConfig from './config/app-config.json'
import SampleService from './services/sampleService'

const CognitoService = new CognitoAuthService()
const api = new SampleService()

function App() {
  const [userData, setUserData] = React.useState({});
  const [host, setHost] = React.useState([]);
  const [browser, setBrowser] = React.useState([]);
  // onload of the pgae, validate token and get user's information from Cognito using Amplify library
  // token is baing passed along with cognito redirect_url ( which in this case localhost:3000)
  useEffect(() => {
    CognitoService.getCurrentUser().then((result) => {
      console.log('user from session ', result)
      if (result) {
        console.log('attributes : ', result.attributes)
        setUserData(result)
      }
      callChildFn(result);
    })

    api.sampleRequest({}).then(response => {
      setHost(response.origin)
      setBrowser(response['User-Agent'])
      console.error('Sample request response =', response)
    })
      .catch(e => {
        console.error('API ERROR:', e)
        //handle error.
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
      {/*
      *  followig  code demonstrates how to display informaiton depending on users login status , 
      *  here we made a backed API call after login and displaying http response headers upon successful login. 
      *
      */}
      <header className="App-header">
        <p>
          Hello <b>{userData.attributes ? userData.attributes.given_name : ''} </b> , Welcome to Sample ReactJS and Cognito application
        </p>
        {!userData.attributes ?
          <a
            className="App-link"
            href={apiConfig.LoginURL}
            rel="noopener noreferrer"
          >
            Login
          </a>
          :
          <div>
            <Container
              header={
                <Header
                  variant="h2"
                  description=""
                >
                  Response headers from API
                </Header>
              }
            >
              <b>Origin</b> : {host ? host : 'loading'}<br />
              <b>User-Agent</b> : {browser ? browser : 'loading'}<br />
            </Container>
            <br />
            <Button variant="primary" onClick={CognitoService.handleSignOut}>Logout</Button>
          </div>
        }
      </header>
    </div>
  );
}

export default App;
