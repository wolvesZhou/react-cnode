const path = require('path');
const HTMLPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const isDev = process.env.NODE_ENV === 'development';

const config = {
  entry: {
    app: path.join(__dirname, '../client/app.js')
  },
  output: {
    filename: '[name].[hash].js',  // hash缓存
    path: path.join(__dirname, '../dist'),
    publicPath: '/public/'  // 静态资源引用路径
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /.(js|jsx)$/,
        loader: 'eslint-loader',
        exclude: [
          path.resolve(__dirname, '../node_modules')
        ]
      },
      {
        test: /.jsx$/,
        loader: 'babel-loader'
      },
      {
        test: /.js$/,
        loader: 'babel-loader',
        exclude: [
          path.join(__dirname, '../node_modules')
        ]
      }
    ]
  },
  plugins: [
    // 定义我们自己的HTML模板，同时把webpack生成的entry都注入到HTML里面
    new HTMLPlugin({
      template: path.join(__dirname, '../client/template.html')
    })
  ]
};

if (isDev) {
  // 关于热更新的一些配置react-hot-loader官方提供了做法，直接打包下面的patch文件就可以了
  config.entry = {
    app: [
      'react-hot-loader/patch',
      path.join(__dirname, '../client/app.js')
    ]
  }
  config.devServer = {
    host: '0.0.0.0',
    port: '8888',
    contentBase: path.join(__dirname, '../dist'),
    hot: true,
    // 错误显示遮罩层
    overlay: {
      errors: true
    },
    // 与output设置的publicPath对应起来，只有前面加public才能访问到我们的静态文件
    publicPath: '/public',
    // 错误返回页面配置，已经建立了映射,dist下面的public/index.html
    historyApiFallback: {
      index: '/public/index.html'
    }
  },
    config.plugins.push(new webpack.HotModuleReplacementPlugin())
}

module.exports = config;
