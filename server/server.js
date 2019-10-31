const express = require('express');
const ReactSSR = require('react-dom/server');
const favicon = require('serve-favicon');
const fs = require('fs');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

const app = express();

app.use(favicon(path.join(__dirname, '../images/103118390629_03312938144248371542-22 (1).ico')));

if (!isDev) {
  // 用了commonjs以及在node环境下require，记得取default
  const serverEntry = require('../dist/server.entry').default;
  const template = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8'); // 不指定utf8格式，是buffer，不是String
  // public可以在服务端用来区别什么路径返回静态内容，什么路径返回服务端渲染的代码，express处理静态文件
  app.use('/public', express.static(path.join(__dirname, '../dist')));

  app.get('*', (req, res) => {
    const appString = ReactSSR.renderToString(serverEntry);
    res.send(appString);
  });
} else {
  const decStatic = require('./utils/dev-static');
  decStatic(app);
}

app.listen(3333, () => {
  console.log('server is listening on 3333');
});
