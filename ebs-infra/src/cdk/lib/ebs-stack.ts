import * as cdk from 'aws-cdk-lib';
import * as config from "../../../../environment-config";
import archiver from 'archiver';
import { createWriteStream } from 'fs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53targets from "aws-cdk-lib/aws-route53-targets";


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
        const appName = 'WebApp4';
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
        // Create role and instance profile
        const myRole = new cdk.aws_iam.Role(this, `${appName}-elasticbeanstalk-ec2-role`, {
            assumedBy: new cdk.aws_iam.ServicePrincipal('ec2.amazonaws.com'),
        });
        const managedPolicy = cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('AWSElasticBeanstalkWebTier');
        myRole.addManagedPolicy(managedPolicy);
        const myProfileName = `${appName}-InstanceProfile`;
        new cdk.aws_iam.CfnInstanceProfile(this, myProfileName, {
            instanceProfileName: myProfileName,
            roles: [
                myRole.roleName
            ]
        });

        // Create the Route 53 Hosted Zone
        const zone = new route53.HostedZone(this, "HostedZone", {
            zoneName: config.HOST_NAME,
        });

        // Create a new SSL certificate in ACM
        const cert = new acm.Certificate(this, "Certificate", {
            domainName: config.HOST_NAME,
            validation: acm.CertificateValidation.fromDns(zone),
        });


        // Elastic Beanstalk environment configurations
        const optionSettingProperties: cdk.aws_elasticbeanstalk.CfnEnvironment.OptionSettingProperty[] = [
            {
                namespace: 'aws:autoscaling:launchconfiguration',
                optionName: 'IamInstanceProfile',
                value: myProfileName,
            },
            {
                namespace: 'aws:autoscaling:asg',
                optionName: 'MinSize',
                value: '1',
            },
            {
                namespace: 'aws:autoscaling:asg',
                optionName: 'MaxSize',
                value: '1',
            },
            {
                namespace: 'aws:autoscaling:asg',
                optionName: 'Availability Zones',
                value: 'Any',
            },
            {
                namespace: 'aws:elasticbeanstalk:environment',
                optionName: 'LoadBalancerType',
                value: 'application',
            },
            {
                namespace: "aws:elb:healthcheck",
                optionName: "HealthyThreshold",
                value: "3"
            },
            {
                namespace: "aws:elb:healthcheck",
                optionName: "Interval",
                value: "10"
            },
            {
                namespace: "aws:elb:healthcheck",
                optionName: "Target",
                value: "TCP:80"
            },
            {
                namespace: "aws:elb:healthcheck",
                optionName: "Timeout",
                value: "5"
            },
            {
                namespace: "aws:elb:healthcheck",
                optionName: "UnhealthyThreshold",
                value: "5"
            },
            {
                namespace: "aws:elb:listener:80",
                optionName: "ListenerProtocol",
                value: "HTTP"
            },
            {
                namespace: "aws:elb:listener:443",
                optionName: "InstancePort",
                value: "80"
            },
            {
                namespace: "aws:elb:listener:80",
                optionName: "InstancePort",
                value: "80"
            },
            {
                namespace: "aws:elb:listener:443",
                optionName: "InstanceProtocol",
                value: "HTTP"
            },
            {
                namespace: "aws:elb:listener:80",
                optionName: "InstanceProtocol",
                value: "HTTP"
            },
            {
                namespace: "aws:elb:listener:443",
                optionName: "ListenerEnabled",
                value: "true"
            },
            {
                namespace: "aws:elb:listener:80",
                optionName: "ListenerEnabled",
                value: "true"
            },
            {
                namespace: "aws:elb:loadbalancer",
                optionName: "CrossZone",
                value: "false"
            },
            {
                namespace: "aws:elb:loadbalancer",
                optionName: "LoadBalancerHTTPPort",
                value: "80"
            },
            {
                namespace: "aws:elb:loadbalancer",
                optionName: "LoadBalancerHTTPSPort",
                value: "OFF"
            },
            {
                namespace: "aws:elb:loadbalancer",
                optionName: "LoadBalancerPortProtocol",
                value: "HTTP"
            },
            {
                namespace: "aws:elb:loadbalancer",
                optionName: "LoadBalancerSSLPortProtocol",
                value: "HTTPS"
            },
            {
                namespace: "aws:elb:policies",
                optionName: "ConnectionDrainingEnabled",
                value: "false"
            },
            {
                namespace: "aws:ec2:vpc",
                optionName: "VPCId",
                value: config.VPC_ID
            },
            {
                namespace: "aws:ec2:vpc",
                optionName: "Subnets",
                value: `${config.PRIVATE_SUB1},${config.PRIVATE_SUB2}`
            },
            {
                namespace: "aws:ec2:vpc",
                optionName: "ELBSubnets",
                value: `${config.PUBLIC_SUB1},${config.PUBLIC_SUB2}`
            },
            {
                namespace: 'aws:ec2:instances',
                optionName: 'InstanceTypes',
                value: 't3.large',
            },
            {
                namespace: "aws:ec2:vpc",
                optionName: "ELBScheme",
                value: "public"
            }
        ];

        // Create an Elastic Beanstalk environment to run the application
        const ebEnv = new cdk.aws_elasticbeanstalk.CfnEnvironment(this, 'Environment', {
            environmentName: `${appName}-env`,
            applicationName: app.applicationName || appName,
            solutionStackName: '64bit Amazon Linux 2 v5.6.4 running Node.js 16',
            optionSettings: optionSettingProperties,
            versionLabel: appVersionProps.ref,
        });

        /*
        //Create A Record Custom Domain to CloudFront CDN
        new route53.ARecord(this, "SiteRecord", {
            recordName: config.HOST_NAME,
            target: route53.RecordTarget.fromAlias(new route53targets.ElasticBeanstalkEnvironmentEndpointTarget(ebEnv.attrEndpointUrl)),
            zone
        });
        */


        // Add a Route 53 alias with the Load Balancer as the target
        // CDK doesn't support this feature
        /*
        new route53.ARecord(this, "AliasRecord", {
            zone: zone,
            target: route53.RecordTarget.fromAlias(
            new route53targets.ElasticBeanstalkEnvironmentEndpointTarget(ebEnv.attrEndpointUrl)
            ),
        });
        */

        // Outputs
        new cdk.CfnOutput(this, 'eb-env-endpoint-export', {
            exportName: 'eb-env-endpoint-url',
            value: ebEnv.attrEndpointUrl
        });
    }
}
