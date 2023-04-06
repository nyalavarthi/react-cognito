import React, { useEffect, useRef } from 'react';
import './App.css';
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";

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

  useEffect(() => {
    CognitoService.getCurrentUser().then((result) => {
      console.log('user from session ', result)
      if (result) {
        console.log('attributes : ', result.attributes)
        console.log('result.attributes.email ', result.attributes.given_name)
        //setUser({ name: result.attributes.email, groups: result.attributes['custom:groups'], loggedIn: true })
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
        //setDeleteMsg('Failed to add User , error : "' + e.message)       
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
              <b>Origin</b> : {host ? host : 'loading'}<br/>
              <b>User-Agent</b> : {browser ? browser : 'loading'}<br/>
            </Container>

            <a
              className="App-link"
              href="#"
              onClick={CognitoService.handleSignOut}
              rel="noopener noreferrer"
            >
              <p> 
              Logout
              </p>
            </a>

          </div>

        }
      </header>
    </div>
  );
}

export default App;
