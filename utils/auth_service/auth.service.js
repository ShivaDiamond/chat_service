const axios = require( 'axios' );
const config = require( '../../config/index' );

class AuthService
{
    static async check_token( token )
    {
        try
        {
            // Make a request to the external API to validate the token
            const response = await axios.get( this.getCheckTokenUrl(), {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 5000
            } );

            if ( response.status >= 300 || !response.data?.data )
            {
                throw new Error( response.data?.data || 'The authentication service encountered an error.' );
            }

            return response.data.data;
        }
        catch ( error )
        {
            throw new Error( error.response?.data?.message || 'Authentication check failed.' );
        }
    }

    static getCheckTokenUrl()
    {
        return this.getBaseUrl() + '/auth/check';
    }

    static getBaseUrl()
    {
        return config?.auth_service?.base_url || '';
    }
}

module.exports = AuthService;
