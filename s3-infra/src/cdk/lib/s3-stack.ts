import * as cdk from 'aws-cdk-lib';
import * as config from "../../../../environment-config";
import archiver from 'archiver';
import { createWriteStream } from 'fs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from "aws-cdk-lib/aws-route53";
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as targets from 'aws-cdk-lib/aws-route53-targets';


export class CdkEbInfraStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        // Construct an S3 asset from the ZIP located from directory up.
        console.log('__dirname ', __dirname)
        const directory = `${__dirname}/../../../../web`;
        console.log('directory : ', directory)
        const output = `${__dirname}/../app.zip`;
        console.log('output : ', output)
        const archive = archiver('zip', { zlib: { level: 9 } });
        const stream = createWriteStream(output);

        archive.pipe(stream);
        archive.directory(directory, false);
        archive.finalize();

        const webAppZipArchive = new cdk.aws_s3_assets.Asset(this, 'WebZip', {
            path: `${__dirname}/../app.zip`,
        });
        console.log('webAppZipArchive : ', webAppZipArchive)
        // Create a ElasticBeanStalk app.
        const appName = 'WebApp3';
        const app = new cdk.aws_elasticbeanstalk.CfnApplication(this, 'WebApp', {
            applicationName: appName,
        });
        // Create an app version from the S3 asset defined earlier
        const appVersionProps = new cdk.aws_elasticbeanstalk.CfnApplicationVersion(this, 'AppVersion', {
            applicationName: appName,
            sourceBundle: {
                s3Bucket: webAppZipArchive.s3BucketName,
                s3Key: webAppZipArchive.s3ObjectKey,
            },
        });
        // Make sure that Elastic Beanstalk app exists before creating an app version
        appVersionProps.addDependsOn(app);

        //Create S3 Bucket web hosting
        const siteBucket = new s3.Bucket(this, "SiteBucket", {
            bucketName: config.HOST_NAME,
            websiteIndexDocument: "index.html",
            publicReadAccess: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY
        })


        // Create the Route 53 Hosted Zone
        const zone = new route53.HostedZone(this, "HostedZone", {
            zoneName: config.HOST_NAME,
        });


        // Create a new SSL certificate in ACM
        const cert = new acm.Certificate(this, "Certificate", {
            domainName: config.HOST_NAME,
            validation: acm.CertificateValidation.fromDns(zone),
        });


        //Create CloudFront Distribution
        const siteDistribution = new cloudfront.CloudFrontWebDistribution(this, "SiteDistribution", {
            /*
            aliasConfiguration: {
                acmCertRef: cert.certificateArn,
                names: [config.HOST_NAME],
                securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2019,
                sslMethod: cloudfront.SSLMethod.SNI,
            },*/
            viewerCertificate: cloudfront.ViewerCertificate.fromIamCertificate(
                "3759bc0e-f497-4d94-9c00-adb5448c4fb7",
                {
                    aliases: [config.HOST_NAME],
                    securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2019
                    //sslMethod: cloudfront.SSLMethod.SNI, // default
                },
            ),
            originConfigs: [{
                customOriginSource: {
                    domainName: siteBucket.bucketWebsiteDomainName,
                    originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY
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



    }
}
