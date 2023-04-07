#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CognitoStack } from "../lib/cognito-stack";
import * as config from "../../../../environment-config";

const app = new cdk.App();

new CognitoStack(app, "CognitoStack", {
  env: config.env
})
