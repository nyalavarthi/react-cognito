#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from "../lib/api-stack";
import * as config from "../../../environment-config";

const app = new cdk.App();
new ApiStack(app, "ApiStack", {
  env: config.env
})
