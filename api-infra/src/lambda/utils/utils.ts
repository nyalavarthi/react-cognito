import JwtPayload from './JwtPayload'
import jwt_decode from 'jwt-decode';

export const ALLOWED_SPECIAL_CHARS = ' -_.*$@!&%()+?,'
export const VA_DOMAIN = 'https://prod.wed.vaec.va.gov'
export const WSX_DOMAINS = ['https://wsx.awesomedomain.info', 'http://localhost:3000', VA_DOMAIN, '*.amazoncognito.com']

export default class Utils {
    /**
     * 
     * @param input 
     * @returns 
     */
    static addKey(input: any) {
        //if input is not undefined 
        if (input.data.workstreams) {
            for (let i = 0; i < input.workstreams.data.length; i++) {
                input.workstreams.data[i].workstream.key = i;
            }
        }
        else if (input.data) {
            if (input.data > 0 && input.data[0]?.concern) {
                for (let i = 0; i < input.data.length; i++) {
                    input.data[i].concern.key = i;
                }
            } else {
                for (let i = 0; i < input.data.length; i++) {
                    input.data[i].key = i;
                }
            }
        } else if (input) {
            for (let i = 0; i < input.length; i++) {
                input[i].key = i;
            }
        }
        var output = input
        return output;
    }

    static getDecodedToken(token: string) {
        const decoded: JwtPayload = jwt_decode(token);
        return decoded
    }
    /**
     * 
     * @param str 
     * @param statusCode 
     * @param origin 
     * @returns 
     */
    static message(str: any, statusCode: number, origin: any) {
        var allowedDomain = VA_DOMAIN //VA's dmain is the default
        if (WSX_DOMAINS.indexOf(origin) > -1) {
            allowedDomain = origin
        } else {
            console.log('Origin not matched ', origin)
        }
        const response = {
            statusCode: statusCode,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": allowedDomain,
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                "Access-Control-Allow-Credentials": true,
                "Content-Security-Policy": "default-src 'none'; img-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; frame-ancestors 'self'; frame-src  'self'",
                "x-xss-protection": "1; mode=block",
                "x-frame-options": "DENY",
                "x-content-type-options": "nosniff",
                "Strict-Transport-Security": "max-age=3600; includeSubDomains",
                "Set-Cookie": "flavor=choco; SameSite=Strict; Secure",
                "Cache-Control": "no-cache, no-store, must-revalidate, private",
                "Pragma": "no-cache",
                "Expired": 0
            },
            body: JSON.stringify(str),
        };
        return response;
    }
    /**
     * 
     * @param x 
     * @param min 
     * @param max 
     * @returns 
     */
    static inRange(x: number, min: number, max: number) {
        return ((x - min) * (x - max) <= 0);
    }

    /**
     * 
     * @param event 
     * @param user 
     * @returns 
     */
    static jsonLogData(event: any, user: string) {
        let logData = {
            'api': event.resource, 'user': user, 'sourceIp': event.requestContext.identity.sourceIp,
            'requestTime': event.requestContext.requestTime, 'origin' : event.headers.origin,
            'userAgent' : event.requestContext.identity.userAgent
        }
        return JSON.stringify(logData)
    }

}