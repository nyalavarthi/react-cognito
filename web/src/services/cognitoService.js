// 
// 
import { Amplify, Auth, API } from 'aws-amplify'
import cognitoPool from '../config/cognito-config.json'
import apiConfig from '../config/app-config.json'

Amplify.configure({
    API: {
        endpoints: [
            {
                name: "API",
                endpoint: apiConfig.API.endpoints[0].endpoint,
                custom_header: async () => {
                    return { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` }
                }
            }
        ]
    }
});


class CognitoAuthService {

    constructor() {
        Amplify.configure({
            Auth: {
                // REQUIRED - Amazon Cognito Region
                region: cognitoPool.Auth.region,
                // OPTIONAL - Amazon Cognito User Pool ID
                userPoolId: cognitoPool.Auth.userPoolId,
                // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
                userPoolWebClientId: cognitoPool.Auth.userPoolWebClientId,
                // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
                mandatorySignIn: false,
                // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
                authenticationFlowType: 'USER_PASSWORD_AUTH',
                // OPTIONAL - Hosted UI configuration
                oauth: {
                    domain: cognitoPool.Auth.webAppDomain,
                    //scope: ['myresourceserver/awesomeapi.read', 'myresourceserver/awesomeapi.write'],
                    redirectSignIn: cognitoPool.Auth.redirectSignIn,
                    redirectSignOut: cognitoPool.Auth.redirectSignOut,
                    responseType: 'code'
                }
            }
        });
    }

    async getCurrentUser() {
        try {
            const authUser = await Auth.currentAuthenticatedUser();
            console.log('authUser: ', authUser);
            //console.log('email: ', authUser.username);
            //console.log('groups: ', authUser.signInUserSession.accessToken.payload['cognito:groups']);
            return authUser
        } catch (e) {
            console.log('error happened', e);
        }
    }

    async handleSignOut(event) {
        if (event)
            event.preventDefault();
        try {
            await Auth.signOut();
            console.log('handleSignOut invoked ---->')
        } catch (error) {
            console.log('error signing out: ', error);
        }
    }

}
export default CognitoAuthService;