const axios = require( 'axios' );
const config = require( '../../config/index' );

class DmdService
{
    static async checkProfile( token )
    {
        try
        {
            // Make a request to the external API to validate the token
            const response = await axios.get( this.getCheckProfileUrl(), {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 5000
            } );

            if ( response.status >= 300 || !response.data?.data )
            {
                throw new Error( response.data?.data || 'The diamond service encountered an error.' );
            }

            return response.data.data;
        }
        catch ( error )
        {
            throw new Error( error.response?.data?.message || 'Check user\'s profile has failed.' );
        }
    }

    static async indexBatchProfiles( token, profile_ids )
    {
        try
        {
            // Make a request to the external API to validate the token
            const response = await axios.get( this.getIndexedBatchProfilesUrl( profile_ids ), {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 5000
            } );

            if ( response.status >= 300 || !response.data?.data )
            {
                throw new Error( response.data?.data || 'The diamond service encountered an error.' );
            }

            return response.data.data;
        }
        catch ( error )
        {
            throw new Error( error.response?.data?.message || 'Index batch profiles has failed.' );
        }
    }

    static getCheckProfileUrl()
    {
        return this.getBaseUrl() + '/api/users/check';
    }

    static getIndexedBatchProfilesUrl( profile_ids )
    {
        return this.getBaseUrl() + `/api/profiles/batch?profile_ids=${profile_ids.join( ',' )}`;
    }

    static getBaseUrl()
    {
        return config?.dmd_service?.base_url || '';
    }
}

module.exports = DmdService;
