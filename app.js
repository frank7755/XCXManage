const Koa = require('koa');
const router = require('koa-router')(); // 注意这里最后是函数调用
const fs = require('fs');
const cors = require('koa2-cors');
const httpProxy = require('http-proxy');
const app = new Koa();
const server = require('koa-files');
const target = 'http://114.67.90.231:8888';
const proxy = httpProxy.createProxyServer({ target, changeOrigin: true });

app.use(server());

// 添加路由

app.use(cors());

router.all('/api/*', async (ctx, next) => {
  ctx.respond = false;

  await proxy.web(ctx.req, ctx.res);
});

router.get(
  '*',
  async (
    ctx,
    next // 根路由
  ) => {
    ctx.type = 'text/html';
    ctx.body = fs.createReadStream('./index.html');
  }
);

app.use(router.routes());

app.listen(8080);

console.log('Server running at http://127.0.0.1:8080');
