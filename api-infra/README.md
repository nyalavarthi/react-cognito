# AWS Backend Infrastructure project


This project uses AWS CDK to create the following AWS resources in your existing VPC. Please refer to the file react-cognito/environment-config.ts and update your VPC, Subnet, and Cognito pool ID information accordingly. Additionally, this project implements cdk-nag to check for rule violations and enforce best practices.

- Amazon API Gateway
- AWS Lambda’s
- AWS WAF 
- CDK nag


The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful cdk commands

`cdk bootstrap`
`cdk synth`
`cdk deploy ApiStack` ( cdk deploy stackname)
`cdk destroy ApiStack`
`cdk deploy --all`