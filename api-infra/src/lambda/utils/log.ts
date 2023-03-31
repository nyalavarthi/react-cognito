
/*
 * Custom logger class with minimal implementation of logger functions
 */

const DEBUG: string = 'DEBUG'
const INFO: string = 'INFO'


export default class Log {


    logLevel: string = INFO; //default setting

    /**
     * Constructor
     * @param {string}  logLevel - INFO | DEBUG | ERROR | TRACE
     */
    constructor(logLevel: string) {
        this.logLevel = logLevel
    }

    /**
     * debug impl
     * @param {string}  message - log message 
     * @param {string}  params - additional parameters
     */
    debug(message: string, params: any = '') {
        if (this.logLevel === DEBUG) {
            console.debug(message, params)
        }
    }
    /**
    * info impl
    * @param {string}  message - log message 
    * @param {string}  params - additional parameters
    */
    info(message: string, params: any = '') {
        if (this.logLevel === INFO || this.logLevel === DEBUG) {
            console.info(message, params)
        }
    }

    /**
    * error impl
    * @param {string}  message - log message 
    * @param {string}  params - additional parameters
    */
    error(message: string, params: any = '') {
        console.error(message, params)
    }

    /**
    * trace impl
    * @param {string}  message - log message 
    * @param {string}  params - additional parameters
    */
    trace(message: string, params: any = '') {
        console.trace(message, params)
    }

}