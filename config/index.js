require( 'dotenv' ).config();

module.exports = {
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 3000,
    mongo_uri: process.env.MONGO_URI,
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || '',
        db: process.env.REDIS_DB ? parseInt( process.env.REDIS_DB, 10 ) : 0,
    },
    auth_service: {
        base_url: process.env.AUTH_SERVICE_BASE_URL || 'auth.app.ir',
    },
    dmd_service: {
        base_url: process.env.DMD_SERVICE_BASE_URL || 'app.ir',
    }
};
