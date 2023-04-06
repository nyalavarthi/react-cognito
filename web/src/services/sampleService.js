import { Amplify, API, Auth } from 'aws-amplify';
import apiConfig from './../config/app-config.json'

Amplify.configure({
    API: {
        endpoints: [
            {
                name: "MyAPIGatewayAPI",
                endpoint: apiConfig.API.endpoints[0].endpoint,
                custom_header: async () => {
                    return { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` }
                }
            }
        ]
    }
});


class SampleService {

    /**
     * 
     * @param {*} name 
     * @returns 
     */
    async sampleRequest(name) {
        console.log('calling sampleService')
        const apiName = 'MyAPIGatewayAPI';
        const path = '/sampleService';
        const myInit = {
            headers: {},
            //response: true,
            queryStringParameters: {
                //name: name,
            }
        };
        return API.get(apiName, path, myInit);
    }

}
export default SampleService;


