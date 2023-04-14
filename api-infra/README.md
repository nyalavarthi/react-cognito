# AWS Backend Infrastructure project


This project uses AWS CDK to create the following AWS resources in your existing VPC. Please refer to the file react-cognito/environment-config.ts and update your VPC, Subnet, and Cognito pool ID information accordingly. Additionally, this project implements cdk-nag to check for rule violations and enforce best practices.

1. Amazon API Gateway
2. AWS Lambda’s
3. AWS WAF 
4. CDK nag


The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful cdk commands

`cdk bootstrap`
`cdk synth`
`cdk deploy ApiStack` ( cdk deploy stackname)
`cdk destroy ApiStack`
`cdk deploy --all`