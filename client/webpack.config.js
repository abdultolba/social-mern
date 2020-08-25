const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const WebpackBundlerAnalyzer = require('webpack-bundle-analyzer')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
	entry: './src/app.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.[hash].js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			},
			{
				test: /\.s?css$/,
				use: [
					{
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../',
            },
	        },
					'css-loader?url=false',
    			'sass-loader'
				]
			},
			{
		        test: /\.(png|jpe?g|gif)$/i,
		        use: {
		        	loader: 'file-loader',
		        	options: {
		        		outputPath: 'assets/images/'
		        	}
		        }
			},
	    {
		    test: /\.svg$/,
				use: [
			    	{
			      		loader: "babel-loader"
			    	},
			    	{
			      		loader: "react-svg-loader",
			      		options: {
			        		jsx: true
			      		}
			    	}
			  	]
  			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: 'src/assets/index.html'
		}),
		new MiniCssExtractPlugin({
				filename: '[name].[hash].css',
	      chunkFilename: '[id].[hash].css',
	      ignoreOrder: false,
	    }),
		new CopyPlugin([
			{ from: 'src/assets/images', to: 'assets/images'}
		])
	],
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
	    historyApiFallback: true,
	    publicPath: '/'
	}
}