'use strict';
let webpack = require('webpack');
let fs = require('fs');
let path = require('path');

let entryPath = __dirname + '/src/entry/';

let entry = fs.readdirSync(entryPath).reduce((r, fileName) => {
        r[fileName.replace(/\.js$/, '')] = entryPath + fileName;
return r;
}, {});

let node_modules_dir = path.resolve(__dirname, 'node_modules');

module.exports = {
    entry: entry,
    plugins: [new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
            // 'process.env.NODE_ENV': JSON.stringify('production')
        })],
    output: {
        path: __dirname + '/dist/static/js',
        filename: "[name].js"
    },
    module: {
        preLoaders: [
            {
                test: /\.jsx?$/, loader: "babel-loader",
                query: {
                    presets: [
                        'react',
                        'es2015'
                    ]
                }
            }
        ],
        loaders: [
            // LESS
            {
                test: /\.less$/,
                exclude: [node_modules_dir],
                loader: 'style!css-loader!less-loader'
            },
            {
                test: /\.css$/,
                exclude: [node_modules_dir],
                loader: 'style!css-loader?modules'
            },
            {
                test: /\.json$/,
                exclude: [node_modules_dir],
                loader: 'json-loader'
            }
        ]
    }
};
