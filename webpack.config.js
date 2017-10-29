const config = require('./config');

module.exports = {
    entry: "./src/Treklog.js",
    output: {
        path: __dirname + '/public/assets/js',
        filename: "bundle.js"
    },
    devServer: {
        contentBase: './public'
    },
    plugins: [
        config
    ]
};