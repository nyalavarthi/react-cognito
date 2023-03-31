# WSX services Infrastructure project


This project creates following AWS resources in your existing VPC,  follow the file WSX/environment-config.ts and update your VPC and Subnet, Cognito pool id information accordingly.


1.	Amazon API Gateway
2.	AWS Lambda’s
3.	AWS WAF 
4.	Amazon Cognito



The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful cdk commands

`cdk bootstrap`
`cdk synth`
`cdk deploy ApiStack` ( cdk deploy stackname)
`cdk destroy ApiStack`
`cdk deploy --all`