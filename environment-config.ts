

//export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000/";
// This value is the output of S3 / cloudfront deployment ( Cloud front distribution URL)
export const CLIENT_URL = process.env.CLIENT_URL || ""; 
// this value is only required for ElasticBeanstalk deployment option using ACM cert
export const HOST_NAME = "nyreactapp.us" 
//private sub for ebs and api gateway
export const PRIVATE_SUB1 = ""
export const PRIVATE_SUB2 = ""
//Use if setting ELB to public. - only needed for Beanstalk deployment option
export const PUBLIC_SUB1 = ""
export const PUBLIC_SUB2 = ""

//used for ApiStack
export const AZ1 = "us-east-1a"
export const AZ2 = "us-east-1b"


export const ACCOUNT = ""
export const REGION = "us-east-1"
export const VPC_ID = ""
export const COGNITO_USER_POOL_NAME = "sample-pool-showcase"
export const COGNITO_DOMAIN_NAME = "sample-domain-showcase"
export const env = { account: ACCOUNT, region: REGION };
export const LOG_LEVEL = 'DEBUG'
export const API_WAF_NAME = 'sample-api-waf'
export const BEANSTALK_SOLUTION = '64bit Amazon Linux 2 v5.7.0 running Node.js 16'
export const COGNITO_USER_POOL_ID = ''
export const COGNITO_POOL_ARN = 'arn:aws:cognito-idp:us-east-2:'+ACCOUNT+':userpool/'+COGNITO_USER_POOL_ID
export const APP_TAG = "SAMPLE-APP"
