
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000/";

//private sub for ebs
export const PRIVATE_SUB1 = "subnet-42282b0f"
export const PRIVATE_SUB2 = "subnet-f483fdd5"
//Use if setting ELB to public.
export const PUBLIC_SUB1 = "subnet-032f2355177bb1773"
export const PUBLIC_SUB2 = "subnet-096dc2ede66cf4a21"

//Cognito pool
export const VPC_ID = "vpc-372ea24a"
export const COGNITO_USER_POOL_NAME = "sample-pool-showcase"
export const COGNITO_DOMAIN_NAME = "sample-domain-showcase"
export const env = { account: "718164670125", region: 'us-east-1' };