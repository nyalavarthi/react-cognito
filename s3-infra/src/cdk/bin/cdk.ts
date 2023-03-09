#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkS3InfraStack } from "../lib/s3-stack";
import * as config from "../../../../environment-config";

const app = new cdk.App();

new CdkS3InfraStack(app, "S3Stack", {
    env: config.env
  })
  