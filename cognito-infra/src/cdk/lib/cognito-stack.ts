import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as cdk from 'aws-cdk-lib';
import * as config from "../../../../environment-config";


export class CognitoStack extends cdk.Stack {

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id);

    // User Pool
    const userPool = new cognito.UserPool(this, 'userpool', {
      userPoolName: config.COGNITO_USER_POOL_NAME,
      //selfSignUpEnabled: true,
      signInAliases: {
        email: false,
        username: true
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        groups: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 6,
        requireLowercase: true,
        requireDigits: true,
        requireUppercase: false,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    //enable 'Audit Only' advanced security feature , this will emt metrics to CW logs ( IMP this feature is not supported in GOV cloud)
    //const cfnPool = userPool.node.defaultChild as cognito.CfnUserPool;
    //cfnPool.userPoolAddOns = { advancedSecurityMode: "AUDIT" };


    const clientReadAttributes = new cognito.ClientAttributes()
      .withCustomAttributes(...['groups']);

    const clientWriteAttributes = new cognito.ClientAttributes()
      .withStandardAttributes({
        emailVerified: false,
        phoneNumberVerified: false,
      })
      .withCustomAttributes(...['groups']);

    // User Pool Client
    const userPoolClient = new cognito.UserPoolClient(this, 'userpool-client', {
      userPool,
      oAuth: {
        callbackUrls: [config.CLIENT_URL],
        logoutUrls: [config.CLIENT_URL],
        scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE, cognito.OAuthScope.PHONE, cognito.OAuthScope.COGNITO_ADMIN],
      },
      authFlows: {
        adminUserPassword: true,
        custom: true,
        userSrp: true,
      },
      readAttributes: clientReadAttributes,
      writeAttributes: clientWriteAttributes,
    });

    const cognitoDomain = new cognito.UserPoolDomain(this, 'userpool-domain', {
      cognitoDomain: {
        domainPrefix: config.COGNITO_DOMAIN_NAME,
      },
      userPool: userPool,
    });

    // Outputs
    new cdk.CfnOutput(this, 'cognito-userpool-export', {
      exportName: 'wsx-cognito-userpool-arn',
      value: userPool.userPoolArn
    });
    new cdk.CfnOutput(this, 'wsx-user-pool-export', {
      exportName: 'cognito-userpool-client-id',
      value: userPoolClient.userPoolClientId
    });
    new cdk.CfnOutput(this, 'wsx-cognito-domain-name-export', {
      exportName: 'cognito-userpool-domain-name',
      value: cognitoDomain.domainName
    });
  }
}