import * as cdk from 'aws-cdk-lib';
import * as config from "../../../../environment-config";
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from "aws-cdk-lib/aws-route53";
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as deploy from 'aws-cdk-lib/aws-s3-deployment';
import { ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { NodejsBuild } from 'deploy-time-build';

export class CdkS3InfraStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        //Create S3 Bucket web hosting
        //const siteBucket = new s3.Bucket(this, "SiteBucket", {
        //websiteIndexDocument: 'index.html',
        //websiteErrorDocument: 'error.html',
        removalPolicy: cdk.RemovalPolicy.DESTROY
        // })

        const siteBucket = new s3.Bucket(this, 'AssetBucket', {
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        /*
        const bucketPolicy = new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['s3:PutObject'],
            resources: [siteBucket.bucketArn + '/*'],
            principals: [new iam.AnyPrincipal()]
        }) */
        //siteBucket.addToResourcePolicy(bucketPolicy)
        // Create a CloudFront Origin Access Identity (OAI)
        /*
        const oai = new cloudfront.OriginAccessIdentity(this, 'MyOAI');
        siteBucket.addToResourcePolicy(new iam.PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [siteBucket.arnForObjects('*')],
            principals: [new iam.CanonicalUserPrincipal(
                oai.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
        }));
        */
        // Grant the OAI access to the S3 bucket
        //siteBucket.grantRead(oai);


        const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity');
        const distribution = new cloudfront.CloudFrontWebDistribution(this, 'Distribution', {
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: siteBucket,
                        originAccessIdentity,
                    },
                    behaviors: [
                        {
                            isDefaultBehavior: true,
                        },
                    ],
                },
            ],
            errorConfigurations: [
                {
                    errorCode: 404,
                    errorCachingMinTtl: 0,
                    responseCode: 200,
                    responsePagePath: '/',
                },
                {
                    errorCode: 403,
                    errorCachingMinTtl: 0,
                    responseCode: 200,
                    responsePagePath: '/',
                },
            ]
        });


        // Create the Route 53 Hosted Zone
        const zone = new route53.HostedZone(this, "HostedZone", {
            zoneName: config.HOST_NAME,
        });

        // Create a new SSL certificate in ACM
        const cert = new acm.DnsValidatedCertificate(this, "Certificate", {
            domainName: config.HOST_NAME,
            hostedZone: zone,
            //validation: acm.CertificateValidation.fromDns(zone),
        });

        /*
        const myViewerCertificate = cloudfront.ViewerCertificate.fromAcmCertificate(
            cert,
            {
                aliases: [config.HOST_NAME], // Replace with your own domain aliases
                securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2019,
                sslMethod: cloudfront.SSLMethod.SNI,
            },
        );
        

        //Create CloudFront Distribution
        const siteDistribution = new cloudfront.CloudFrontWebDistribution(this, "SiteDistribution", {
            viewerCertificate: myViewerCertificate,
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: siteBucket,
                        originAccessIdentity: oai,
                    },
                    behaviors: [{
                        isDefaultBehavior: true
                    }]
                }]
        });
        */
        /*
        const cloudfrontDistribution = new cloudfront.Distribution(this, 'CloudFrontDistribution', {
            certificate: cert,
            domainNames: [config.HOST_NAME],
            defaultRootObject: 'index.html',
            defaultBehavior: {
                origin: new origins.S3Origin(siteBucket, {
                    originAccessIdentity: originAccessIdentity
                }),
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                //responseHeadersPolicy: responseHeaderPolicy
            },
        });
        

        //Deploy site to s3
        new deploy.BucketDeployment(this, "Deployment", {
            sources: [deploy.Source.asset("./../../../web/build")],
            destinationBucket: siteBucket,
            distribution: cloudfrontDistribution,
            distributionPaths: ["/*"]

        });
        */

        new NodejsBuild(this, 'ReactBuild', {
            assets: [
              {
                path: '../frontend',
                exclude: ['node_modules', 'dist'],
                commands: ['npm ci'],
                // prevent too frequent frontend deployment, for temporary use
                // assetHash: 'frontend_asset',
              },
            ],
            buildCommands: ['npm run bundle'],
            buildEnvironment: {
              VITE_BACKEND_API_URL: props.backendApi.apiEndpoint,
              VITE_USER_POOL_ID: props.auth.userPool.userPoolId,
              VITE_USER_POOL_CLIENT_ID: props.auth.client.userPoolClientId,
              VITE_AWS_REGION: cdk.Stack.of(props.auth.userPool).region,
            },
            destinationBucket: siteBucket,
            distribution,
            outputSourceDirectory: 'dist',
          });

        //Create A Record Custom Domain to CloudFront CDN
        new route53.ARecord(this, "SiteRecord", {
            recordName: config.HOST_NAME,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
            zone
        });

        // Output the CloudFront distribution domain name
        new cdk.CfnOutput(this, 'DistributionDomainName', {
            value: distribution.distributionDomainName,
        });

    }
}
