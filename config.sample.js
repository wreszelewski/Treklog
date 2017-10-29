const webpack = require('webpack');

const config = new webpack.DefinePlugin({
    FIREBASE_API_KEY: '"api-key"',
    FIREBASE_AUTH_DOMAIN: '"auth-domain"',
    FIREBASE_DATABASE_URL: '"db-url"',
    FIREBASE_PROJECT_ID: '"project-id"',
    FIREBASE_STORAGE_BUCKET: '"storage-bucket"',
    FIREBASE_MESSAGING_SENDER_ID: '"messaging-id"',
    MAPBOX_PUBLIC_ACCESS_TOKEN: '"mapbox-token"',
    NAVIGATION_MAX_LINK_FLIGHT_HEIGHT: '10000'
});

module.exports = config;