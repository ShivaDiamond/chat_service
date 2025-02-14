const DmdService = require( '../utils/dmd_service/dmd.service' );

const authMiddleware = async ( req, res, next ) => {
    try {
        const token = req.headers.authorization?.split( ' ' )[ 1 ];
        if ( !token )
        {
            return res.status( 401 ).json( { message: 'No token provided' } );
        }

        // Validate token via third-party API
        const response = await DmdService.checkProfile( token );

        // Attach user info to request
        req.user = response;
        req.token = token;
        next();
    }
    catch ( error )
    {
        console.error( error );
        return res.status( 401 ).json( { message: 'Unauthorized' } );
    }
};

module.exports = authMiddleware;
