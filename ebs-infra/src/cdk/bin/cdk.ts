#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkEbInfraStack } from "../lib/ebs-stack";
import * as config from "../../../../environment-config";

const app = new cdk.App();

new CdkEbInfraStack(app, "EBSStack", {
    env: config.env
  })
  