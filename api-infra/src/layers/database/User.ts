/**
 * Sample database class shows how to use layers in Lambda
 */class SampleUser {

  constructor() {
  }

    /**
     * Sample get user function
     * @returns JSON object
     */
    async getUser() {
      return {
        name : 'John Smith'
      }
      
  }

}
export default SampleUser;


