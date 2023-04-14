### React web application

The React-based web application demonstrates integration with Amazon Cognito for authorization via Cognito pools, while [Cloudscape](https://cloudscape.design/)  is utilized for UI design.

The Amazon Cognito [hosted UI ](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-integration.html) is utilized for the login process, and upon successful authentication, the user is redirected to the application. The AWS Amplify [library ](https://docs.amplify.aws/lib/q/platform/js/) is utilized for back-end API calls and Cognito integration.

### Application Configurations

Prior to deploying the application, please reser to the environment-config file in the root and config files under web/config directory for any necessary configuration changes.

running the app locally and building project

<pre>
`npm install`
`npm start`
`npm run build`
</pre>