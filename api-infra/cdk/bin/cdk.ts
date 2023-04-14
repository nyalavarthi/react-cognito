#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from "../lib/api-stack";
import * as config from "../../../environment-config";
import { AwsSolutionsChecks } from 'cdk-nag'
import { Aspects } from 'aws-cdk-lib';


const app = new cdk.App();

//add app level global tagging
cdk.Tags.of(app).add("app", config.APP_TAG);

//CDK-NAG
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }))

new ApiStack(app, "ApiStack", {
  env: config.env
})
