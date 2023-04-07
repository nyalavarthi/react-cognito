import JwtPayload from './JwtPayload'
import jwt_decode from 'jwt-decode';

export const CF_DOMAIN = 'https://dhfg5x10pdi4c.cloudfront.net/'
export const WSX_DOMAINS = [CF_DOMAIN, 'http://localhost:3000', '*.amazoncognito.com']

export default class Utils {


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
        var allowedDomain = CF_DOMAIN //VA's dmain is the default
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
     * @param event 
     * @param user 
     * @returns 
     */
    static jsonLogData(event: any, user: string) {
        let logData = {
            'api': event.resource, 'user': user, 'sourceIp': event.requestContext.identity.sourceIp,
            'requestTime': event.requestContext.requestTime, 'origin': event.headers.origin,
            'userAgent': event.requestContext.identity.userAgent
        }
        return JSON.stringify(logData)
    }

}