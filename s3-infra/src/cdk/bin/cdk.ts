#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkEbInfraStack } from "../lib/s3-stack";
import * as config from "../../../../environment-config";

const app = new cdk.App();

new CdkEbInfraStack(app, "S3Stack", {
    env: config.env
  })
  