import * as cognito from 'aws-cdk-lib/aws-cognito';
import { ICertificate } from "@aws-cdk/aws-certificatemanager";
import * as route53 from "@aws-cdk/aws-route53";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from 'aws-cdk-lib';
const fs = require('fs');
import { CLIENT_URL } from "../../../../environment-config";
import { COGNITO_USER_POOL_NAME } from "../../../../environment-config";
import { COGNITO_DOMAIN_NAME } from "../../../../environment-config";

/*
export interface AuthenticationProps {
  rootCertificate: ICertificate,
  rootHostedZone: route53.IHostedZone,
  postAuthTrigger: lambda.Function,
}*/

export class CognitoStack extends cdk.Stack {

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id);

    // User Pool
    const userPool = new cognito.UserPool(this, 'userpool', {
      userPoolName: COGNITO_USER_POOL_NAME,
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

    // yw. why not initialize userPool using these attributes??
    // User Pool Client attributes
    const standardCognitoAttributes = {
      givenName: true,
      familyName: true,
      email: true,
      emailVerified: true,
      address: true,
      birthdate: true,
      gender: true,
      locale: true,
      middleName: true,
      fullname: true,
      nickname: true,
      phoneNumber: true,
      phoneNumberVerified: true,
      profilePicture: true,
      preferredUsername: true,
      profilePage: true,
      timezone: true,
      lastUpdateTime: true,
      website: true,
    };

    const clientReadAttributes = new cognito.ClientAttributes()
      .withStandardAttributes(standardCognitoAttributes)
      .withCustomAttributes(...['groups']);

    const clientWriteAttributes = new cognito.ClientAttributes()
      .withStandardAttributes({
        ...standardCognitoAttributes,
        emailVerified: false,
        phoneNumberVerified: false,
      })
      .withCustomAttributes(...['groups']);


    // User Pool Client
    const userPoolClient = new cognito.UserPoolClient(this, 'userpool-client', {
      userPool,
      oAuth: {
        callbackUrls: [CLIENT_URL],
        logoutUrls: [CLIENT_URL],
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
        domainPrefix: COGNITO_DOMAIN_NAME,
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