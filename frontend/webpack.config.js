const path = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const webpack = require('webpack');

const PATHS = {
    app: path.join(__dirname, 'src/app.js'),
    css: path.join(__dirname, 'css'),
    build: path.join(__dirname, '../assets/server/public/build'),
};

const isDev = process.env.NODE_ENV !== 'production';

const config = {
    mode: 'production',
    devtool: isDev ? 'inline-source-map' : false,
    entry: {
        app: PATHS.app,
    },
    output: {
        path: PATHS.build,
        filename: '[name].js',
    },
    resolve: {
        modules: [
            path.join(__dirname, 'src'),
            path.join(__dirname, 'node_modules'),
        ],
        alias: {
            vue: 'vue/dist/vue.js',
        },
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
    ],
    node: {
        fs: 'empty',
    },
    performance: {
        hints: 'warning',
        maxEntrypointSize: 1512000,
        maxAssetSize: 1512000
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                include: PATHS.app,
                enforce: 'pre',
                loader: 'eslint-loader',
            },
            {
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    loaders: {
                        js: 'babel-loader',
                        css: 'css-loader',
                    }
                },
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: file => (
                    /node_modules/.test(file)
                ),
                query: {
                    presets: ['@babel/preset-env'],
                    compact: false
                },
            },
            {
                test: /\.css$/,
                include: PATHS.css,
                exclude: /node_modules/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: false,
                            fallback: 'vue-style-loader',
                            use: [
                                // "vue-style-loader",
                                'style-loader',
                                {
                                    loader: 'css-loader',
                                    options: {
                                        importLoaders: 1,
                                        sourceMap: isDev
                                    },
                                },
                                {
                                    loader: 'postcss-loader',
                                    options: {
                                        sourceMap: isDev,
                                        config: {
                                            path: path.resolve(__dirname, './postcss.config.js'),
                                        },
                                    },
                                },
                                'resolve-url-loader',
                            ],
                            publicPath: PATHS.build,
                        },
                    },
                    "css-loader",
                ]
            },
            {
                test: /\.css$/,
                include: /node_modules/,
                loaders: [
                    "vue-style-loader",
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: { importLoaders: 1, sourceMap: isDev },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: isDev,
                            config: {
                                path: path.resolve(__dirname, './postcss.config.js'),
                            },
                        },
                    },
                    'resolve-url-loader'
                ]
            },
            {
                test: /\.s[c|a]ss$/,
                use: [
                    "vue-style-loader",
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: { importLoaders: 2, sourceMap: isDev },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: isDev,
                            config: {
                                path: path.resolve(__dirname, './postcss.config.js'),
                            },
                        },
                    },
                    'resolve-url-loader',
                    'sass-loader'
                ]

            },
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                loader: 'url-loader',
            },
            {
                test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file-loader',
                options: {
                    name: '[hash].[ext]',
                    publicPath: '/assets/build/fonts',
                    outputPath: 'fonts',
                }
            },
            {
                test: /\.svg/,
                use: {
                    loader: 'svg-url-loader',
                    options: {},
                },
            },
        ],
    },
};

// No sourcemap for production
if (isDev) {
    const devToolPlugin = new webpack.SourceMapDevToolPlugin({
        filename: '[name].map',
    });

    config.plugins.push(devToolPlugin);
}

module.exports = config;
