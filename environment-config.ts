
//export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000/";
export const CLIENT_URL = process.env.CLIENT_URL || "https://dhfg5x10pdi4c.cloudfront.net/";
export const HOST_NAME = "nyreactapp.us"
//private sub for ebs
export const PRIVATE_SUB1 = "subnet-42282b0f"
export const PRIVATE_SUB2 = "subnet-f483fdd5"
//Use if setting ELB to public.
export const PUBLIC_SUB1 = "subnet-032f2355177bb1773"
export const PUBLIC_SUB2 = "subnet-096dc2ede66cf4a21"

export const AZ1 = "us-east-1a"
export const AZ2 = "us-east-1b"

//Cognito pool
export const ACCOUNT = "718164670125"
export const VPC_ID = "vpc-372ea24a"
export const COGNITO_USER_POOL_NAME = "sample-pool-showcase"
export const COGNITO_DOMAIN_NAME = "sample-domain-showcase"
export const env = { account: ACCOUNT, region: 'us-east-1' };
export const LOG_LEVEL = 'DEBUG'
export const API_WAF_NAME = 'sample-api-waf'
export const BEANSTALK_SOLUTION = '64bit Amazon Linux 2 v5.7.0 running Node.js 16'
export const COGNITO_USER_POOL_ID = 'us-east-1_fNB9bzL9h'
export const WSX_COGNITO_POOL_ARN = 'arn:aws:cognito-idp:us-east-2:'+ACCOUNT+':userpool/'+COGNITO_USER_POOL_ID
