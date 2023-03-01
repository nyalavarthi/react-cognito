import * as cdk from 'aws-cdk-lib';
import * as config from "../../../../environment-config";
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from "aws-cdk-lib/aws-route53";
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as deploy from 'aws-cdk-lib/aws-s3-deployment';

export class CdkEbInfraStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        //Create S3 Bucket web hosting
        const siteBucket = new s3.Bucket(this, "SiteBucket", {
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'error.html',
            removalPolicy: cdk.RemovalPolicy.DESTROY
        })

        const bucketPolicy = new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['s3:PutObject'],
            resources: [siteBucket.bucketArn + '/*'],
            principals: [new iam.AnyPrincipal()]
        })
        //siteBucket.addToResourcePolicy(bucketPolicy)
        // Create a CloudFront Origin Access Identity (OAI)
        const oai = new cloudfront.OriginAccessIdentity(scope, 'MyOAI');

        // Grant the OAI access to the S3 bucket
        siteBucket.grantRead(oai);


        // Create the Route 53 Hosted Zone
        const zone = new route53.HostedZone(this, "HostedZone", {
            zoneName: config.HOST_NAME,
        });


        // Create a new SSL certificate in ACM
        const cert = new acm.Certificate(this, "Certificate", {
            domainName: config.HOST_NAME,
            validation: acm.CertificateValidation.fromDns(zone),
        });

        const myViewerCertificate = cloudfront.ViewerCertificate.fromAcmCertificate(
            cert,
            {
                aliases: ['my-alias.example.com'], // Replace with your own domain aliases
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


        //Create A Record Custom Domain to CloudFront CDN
        new route53.ARecord(this, "SiteRecord", {
            recordName: config.HOST_NAME,
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(siteDistribution)),
            zone
        });

        //Deploy site to s3
        new deploy.BucketDeployment(this, "Deployment", {
            sources: [deploy.Source.asset("./build")],
            destinationBucket: siteBucket,
            distribution: siteDistribution,
            distributionPaths: ["/*"]

        });


        // Output the CloudFront distribution domain name
        new cdk.CfnOutput(scope, 'DistributionDomainName', {
            value: siteDistribution.distributionDomainName,
        });

    }
}
