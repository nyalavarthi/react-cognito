import * as sample from '/opt/database/User.ts'
import Utils from '../utils/utils';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import Log from './../utils/log'

const logLevel = process.env.LOG_LEVEL;
const logger = new Log(String(logLevel))

/**
 * lambda handler function
 * @param event 
 * @returns 
 */
export async function main(
    event: any,
): Promise<APIGatewayProxyResultV2> {
    logger.debug(event);
    if ('/sampleService' == event.resource) {
        return sampleService(event)
    }
    else {
        // invalid path
        return Utils.message("invalid request", 500, event.headers.origin);
    }
}

/**
* Sample API that returns event headers back 
* @param {any}  event - api event
**/
async function sampleService(event: any) {
    var token = Utils.getDecodedToken(event.headers.Authorization)
    let logData = { 'api': event.resource, 'user': token?.email }
    logger.info(JSON.stringify(logData))
    logger.debug(JSON.stringify(logData), JSON.stringify({ 'params': event.queryStringParameters }))
    try {
        //check if Global entry exist
       console.log('test')
    }
    catch (_a) {
        logger.error(`error getting customerList for user ${token?.email}`, _a);
        return Utils.message('error getting customerList: ' + _a, 500, event.headers.origin)
    }
    return Utils.message(event.headers, 200, event.headers.origin)
}
