const axios = require('axios');
const webpack = require('webpack');
const path = require('path');
const proxy = require('http-proxy-middleware');
const MemoryFs = require('memory-fs');
const ReactDomServer = require('react-dom/server');

const serverConfig = require('../../build/webpack.config.server');

// 在服务端获取template模板
const getTemplate = () => {
  return new Promise((resolve, reject) => {
    axios.get('http://localhost:8888/public/index.html')
      .then((res) => {
        resolve(res.data);
      })
      .catch(reject);
  })
}

const Module = module.constructor;

// 内存读写文件
const mfs = new MemoryFs
const serverCompiler = webpack(serverConfig);
serverCompiler.outputFileSystem = mfs;
let serverBundle

// 监听webpack下面entry文件的变化,webpack提供了模块调用的功能
/**
 * stats webpack 打包的一些信息
 */
serverCompiler.watch({}, (err, stats) => {
  if (err) throw err;
  stats = stats.toJson();
  stats.errors.forEach((err) => console.error(err));
  stats.warnings.forEach(warn => console.warn(warn));

  const bundlePath = path.join(
    serverConfig.output.path,
    serverConfig.output.filename
  )
  // 记住webpack编译出来的内容是个字符串，需要把字符换转换为模块
  // 通过一种比较hack的方式，新建了一个module实例，去compile,传入内容，指定文件名
  // 变为我们需要的module并把它放出来
  const bundle = mfs.readFileSync(bundlePath, 'utf-8');
  const m = new Module();
  // 需要指定文件名， 不然无法在缓存中存储
  m._compile(bundle, 'server-entry.js');
  serverBundle = m.exports.default;
});

module.exports = function (app) {

  // 把所有的静态资源都代理到webpack-dev-server启动的服务那边
  app.use('/public', proxy({
    target: 'http://localhost:8888'
  }))

  app.get('*', (req, res) => {
    getTemplate().then(template => {
      const content = ReactDomServer.renderToString(serverBundle);
      res.send(template.replace('<!-- app -->', content));
    })
  })
}
