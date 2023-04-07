import * as cdk from 'aws-cdk-lib';
import * as config from "../../../environment-config";
import * as path from 'path';
/**
 * CDK code to create Lambda, API gateway WAF, and Lambda authorizer  
 */
export class ApiStack extends cdk.Stack {

    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        //vpc lookup 
        const vpc = cdk.aws_ec2.Vpc.fromLookup(this, 'VPC', {
            vpcId: config.VPC_ID
        });

        const myRole = new cdk.aws_iam.Role(this, 'CognitoLambdaRole', {
            assumedBy: new cdk.aws_iam.ServicePrincipal('lambda.amazonaws.com'),
        });
        // Attach the required IAM Policy to the Lambda Role
        const lambdaPolicy = new cdk.aws_iam.Policy(this, 'LambdaPolicy', {
            policyName: 'lambda-service-policy',
            statements: [
                new cdk.aws_iam.PolicyStatement({
                    effect: cdk.aws_iam.Effect.ALLOW,
                    resources: ['*'],
                    actions: [
                        'cognito-idp:AdminAddUserToGroup',
                        'cognito-idp:AdminRemoveUserFromGroup'
                    ]
                })
            ]
        });
        myRole.attachInlinePolicy(lambdaPolicy);
        myRole.addManagedPolicy(cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"));
        myRole.addManagedPolicy(cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonCognitoReadOnly"));
        // only required if your function lives in a VPC
        myRole.addManagedPolicy(cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaVPCAccessExecutionRole"));

        // 👇 Create a SG for lambda
        const lambdaSG = new cdk.aws_ec2.SecurityGroup(this, 'lambda-sg', {
            vpc,
            allowAllOutbound: true,
            description: 'security group for a vpc lambda',
        });

        lambdaSG.addIngressRule(
            cdk.aws_ec2.Peer.ipv4(vpc.vpcCidrBlock),
            cdk.aws_ec2.Port.allTraffic(),
            'allow SSH access from anywhere',
        );

        const subnetIds = [
            config.PRIVATE_SUB1,
            config.PRIVATE_SUB2
        ];

        const azones = new Map<string, string>([
            [config.PRIVATE_SUB1, config.AZ1],
            [config.PRIVATE_SUB2, config.AZ2],
        ]);

        const subnets = subnetIds.map(subnetId => cdk.aws_ec2.Subnet.fromSubnetAttributes(this, subnetId, {
            subnetId: subnetId,
            availabilityZone: azones.get(subnetId)
        }));
        const subnetSelection = subnets;
        console.log('zones :', subnetSelection)

        // 👇 database lib layer
        const dataLayer = new cdk.aws_lambda.LayerVersion(this, 'neptune-layer', {
            compatibleRuntimes: [
                cdk.aws_lambda.Runtime.NODEJS_16_X,
            ],
            code: cdk.aws_lambda.Code.fromAsset('./src/layers'),
            description: 'Sample database classes',
        });


        // utils lambda
        const sampleSvc = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'sampleHandler', {
            runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,    // execution environment
            entry: path.join(__dirname, `../../src/lambda/sample/index.ts`),

            handler: 'main',  // file is "index", function is "handler"
            role: myRole, // user-provided role
            vpc: vpc,
            securityGroups: [lambdaSG],
            allowPublicSubnet: true,

            vpcSubnets: {
                subnets: subnetSelection
            },
            memorySize: 512,
            timeout: cdk.Duration.seconds(59),
            layers: [dataLayer],
            environment: {
                "LOG_LEVEL": config.LOG_LEVEL
            },
            logRetention: cdk.aws_logs.RetentionDays.ONE_YEAR,
        });


        //add CW log grups for API gateway
        const samplelogGroup = new cdk.aws_logs.LogGroup(this, 'WSXAPILogGroup', { retention: cdk.aws_logs.RetentionDays.ONE_YEAR });

        //following way we can add multiple Lambda's to a single API.
        const api = new cdk.aws_apigateway.RestApi(this, 'sample-api', {
            description: 'Work Stream Expeditor API',
            defaultCorsPreflightOptions: {
                allowOrigins: ['*'],
                allowMethods: ['GET', 'PUT', 'POST', 'OPTIONS'],
                allowHeaders: ['*']
            },
            endpointConfiguration: {
                types: [cdk.aws_apigateway.EndpointType.REGIONAL]
            },
            deployOptions: {
                accessLogDestination: new cdk.aws_apigateway.LogGroupLogDestination(samplelogGroup),
                accessLogFormat: cdk.aws_apigateway.AccessLogFormat.jsonWithStandardFields()
            }
        });

        // WAF
        let wafRules: Array<cdk.aws_wafv2.CfnWebACL.RuleProperty> = [];
        //1 restrict zeo location to US
        let geoAllowRule: cdk.aws_wafv2.CfnWebACL.RuleProperty = {
            name: 'geoblockRule',
            priority: 4,
            action: { allow: {} },
            statement: {
                geoMatchStatement: {
                    countryCodes: ['US']
                }
            },
            visibilityConfig: {
                cloudWatchMetricsEnabled: true,
                metricName: 'geoAllow',
                sampledRequestsEnabled: true
            }
        };
        wafRules.push(geoAllowRule);

        // 2 AWS ip reputation List
        let awsIPRepList: cdk.aws_wafv2.CfnWebACL.RuleProperty = {
            name: 'awsIPReputation',
            priority: 3,
            overrideAction: { none: {} },
            statement: {
                managedRuleGroupStatement: {
                    name: 'AWSManagedRulesAmazonIpReputationList',
                    vendorName: 'AWS',
                    excludedRules: []
                }
            },
            visibilityConfig: {
                cloudWatchMetricsEnabled: true,
                metricName: 'awsReputation',
                sampledRequestsEnabled: true
            }
        };
        wafRules.push(awsIPRepList);

        // 3 AWS AnonIPAddress
        let awsAnonIPList: cdk.aws_wafv2.CfnWebACL.RuleProperty = {
            name: 'awsAnonymousIP',
            priority: 2,
            overrideAction: { none: {} },
            statement: {
                managedRuleGroupStatement: {
                    name: 'AWSManagedRulesAnonymousIpList',
                    vendorName: 'AWS',
                    excludedRules: []
                }
            },
            visibilityConfig: {
                cloudWatchMetricsEnabled: true,
                metricName: 'awsAnonymous',
                sampledRequestsEnabled: true
            }
        };
        wafRules.push(awsAnonIPList);

        // 4 AWS Managed Rules ( OWASP top 10 rules)
        let awsManagedRules: cdk.aws_wafv2.CfnWebACL.RuleProperty = {
            name: 'AWS-AWSManagedRulesCommonRuleSet',
            priority: 5,
            overrideAction: { none: {} },
            statement: {
                managedRuleGroupStatement: {
                    name: 'AWSManagedRulesCommonRuleSet',
                    vendorName: 'AWS',
                    excludedRules: [{ name: 'SizeRestrictions_BODY' }]
                }
            },
            visibilityConfig: {
                cloudWatchMetricsEnabled: true,
                metricName: 'awsCommonRules',
                sampledRequestsEnabled: true
            }
        };
        wafRules.push(awsManagedRules);
        // 5 allow ip list
        let ipSetName = 'wax-api-waf-ipset'
        const ipSet = new cdk.aws_wafv2.CfnIPSet(this, ipSetName, {
            name: ipSetName,
            description: ipSetName,
            addresses: [],
            ipAddressVersion: "IPV4",
            scope: "REGIONAL",
        })

        let ipsetRule: cdk.aws_wafv2.CfnWebACL.RuleProperty = {
            name: 'IpSetAllow',
            priority: 1,
            action: {
                block: {},
            },
            statement: {
                ipSetReferenceStatement: {
                    arn: ipSet.getAtt("Arn").toString(),
                },
            },
            visibilityConfig: {
                sampledRequestsEnabled: true,
                cloudWatchMetricsEnabled: true,
                metricName: `${ipSetName}AllowRuleMetric`,
            },
        };
        wafRules.push(ipsetRule);


        const cfnWebACL = new cdk.aws_wafv2.CfnWebACL(this, config.API_WAF_NAME, {
            defaultAction: {
                allow: {}
            },
            scope: 'REGIONAL',
            visibilityConfig: {
                cloudWatchMetricsEnabled: true,
                metricName: config.API_WAF_NAME,
                sampledRequestsEnabled: true,
            },
            name: config.API_WAF_NAME,
            rules: wafRules,
        });

        const webAclAssociation = new cdk.aws_wafv2.CfnWebACLAssociation(this, "webAclAssociation", {
            resourceArn: api.deploymentStage.stageArn,
            webAclArn: cfnWebACL.attrArn,
        })
        webAclAssociation.addDependsOn(cfnWebACL)

        //enable CW log grups for WAF  - LogGroup name must start with 'aws-waf-logs'
        const waflogGroup = new cdk.aws_logs.LogGroup(this, 'WSXWAFAPILogGroup', {
            logGroupName: `aws-waf-logs-sample-api`, // Strange that the name need to start with 'aws-waf-logs' or else CDK will errorout
            retention: cdk.aws_logs.RetentionDays.ONE_YEAR
        });

        //associate CW logs to WAF
        new cdk.aws_wafv2.CfnLoggingConfiguration(this, 'WafLoggingConfig', {

            logDestinationConfigs: [
                // Construct the different ARN format from the logGroupName
                cdk.Stack.of(this).formatArn({
                    arnFormat: cdk.ArnFormat.COLON_RESOURCE_NAME,
                    service: "logs",
                    resource: "log-group",
                    resourceName: waflogGroup.logGroupName,
                })
            ],
            resourceArn: cfnWebACL.attrArn,
        })

        // api authorizer using Cognito userpool
        const authorizer = new cdk.aws_apigateway.CfnAuthorizer(this, 'cfnAuth', {
            restApiId: api.restApiId,
            name: 'wsxAuthorizer',
            type: 'COGNITO_USER_POOLS',
            identitySource: 'method.request.header.Authorization',
            providerArns: [cdk.Fn.importValue('sample-cognito-userpool-arn')],
            //providerArns: [config.WSX_COGNITO_POOL_ARN],
        })

        const sampleService = api.root.addResource('sampleService');
        const lsampleServiceIntegration = new cdk.aws_apigateway.LambdaIntegration(sampleSvc, {
        });
        sampleService.addMethod('GET', lsampleServiceIntegration, {
            authorizationType: cdk.aws_apigateway.AuthorizationType.COGNITO,
            authorizer: { authorizerId: authorizer.ref }
        });

        // Outputs
        new cdk.CfnOutput(this, 'sample-api-export', {
            exportName: 'sample-api-export',
            value: api.restApiId
        });

        new cdk.CfnOutput(this, 'sample-sampleSvc-export', {
            exportName: 'sample-sampleSvc-export',
            value: sampleSvc.functionArn
        });

    }
}