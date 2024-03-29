/**
 * CDK stack to create S3 bucket for web hosting , and builds & deploy Web app artifacts into the bucket .
 * Creates CloudFront distribution for the bucket with OAI policy
 */
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';

export class CdkS3InfraStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        // Create S3 bucket
        const bucket = new s3.Bucket(this, 'Bucket');
        new cdk.CfnOutput(this, 'bucket name', {
            value: bucket.bucketName,
        });
        // Create CloudFront origin access identity
        const oai = new cloudfront.OriginAccessIdentity(this, 'OAI', {
            comment: 'CloudFront origin access identity for S3 bucket',
        });

        // Create CloudFront distribution
        // configures Redirect HTTP to HTTPS by default
        const distribution = new cloudfront.CloudFrontWebDistribution(this, 'Distribution', {
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: bucket,
                        originAccessIdentity: oai,
                    },
                    behaviors: [{ isDefaultBehavior: true }],
                },
            ],
        });

        // Grant CloudFront access to S3 bucket via OAI
        bucket.grantRead(oai);

        // Restrict S3 bucket access to only CloudFront via OAI
        const bucketPolicy = new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            principals: [new iam.CanonicalUserPrincipal(oai.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
            actions: ['s3:GetObject'],
            resources: [`${bucket.bucketArn}/*`],
        });
        bucket.addToResourcePolicy(bucketPolicy);

        // Deploy React build to S3 bucket
        const buildPath = path.join(__dirname, '"./../../../../../web/build');
        // const buildPath = path.join(__dirname, '../build');
        new cdk.CfnOutput(this, 'buildPath', {
            value: buildPath,
        });
    
        new s3deploy.BucketDeployment(this, 'DeployWebsite', {
            sources: [s3deploy.Source.asset(buildPath)],
            destinationBucket: bucket,
            distribution,
            distributionPaths: ['/*'],
        });
    }
}
