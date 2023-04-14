## Sample React - Amazon Cognito applicaiton

The repository aims to showcase the process of building a React application that incorporates Amazon Cognito for authentication and authorization, along with deploying backend infrastructure to the AWS cloud through AWS CDK and AWS CodePipeline.

AWS API Gateway and AWS Lambda are utilized in this project to create backend microservices, which are safeguarded by AWS WAF.

AWS CodeBuild and AWS CodePipeline can be utilized to enable the deployment of this application to AWS Cloud.

There are two options available for deploying the frontend, which you can choose from.
1. Serverless option using Amazon S3 and Amazon Cloudfront 
2. EC2 instance using Amazon ElasticBeanstalk 

Deploying to an EC2 instance with Amazon ElasticBeanstalk is a useful approach in GovCloud since Amazon CloudFront is not accessible in GovCloud.
AWS Elastic Beanstalk automates the details of capacity provisioning, load balancing, auto scaling, and application deployment.

### Repository details
This repository consists of multiple sub-projects, which are listed below:
### api-infra
Creates backend services such as API Gateway, Lambda, & WAF
### cognito-infra
Creates AWS Cognito user pool
### ebs-infra
Creates ElasticBeanstalk instance , builds, and deployes the front-end application  
### s3-infra
Creates an S3 bucket for hosting React code, creates a CloudFront distribution (with OAI), and copies the code into the S3 hosting bucket.
### web
Contains React front-end code
### cicd
Contains Cloudformation templates to create CodePipeline and CodeBuild projects for CICD