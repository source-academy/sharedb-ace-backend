import Koa from 'koa';
import websockify from 'koa-websocket';
import cors from 'kcors';
import json from 'koa-json';
import logger from 'koa-logger';
import bodyParser from 'koa-bodyparser';
import convert from 'koa-convert';
import session from 'koa-session';
import serve from 'koa-static';
// import session from 'koa-session';
import WebSocketJSONStream from 'websocket-json-stream';
// import websocketRoutes from './router/websocket';
import * as routes from './router/';

// Database
import share from './db';

const app = websockify(new Koa(), {
  onConnection: (socket) => {
    const stream = new WebSocketJSONStream(socket);
    stream.on('error', err => {
      if(err.name === "Error [ERR_CLOSED]") {
        // do nothing
        return;
      }
    });
    share.listen(stream);
    // const ping = () => socket.send('{"a":"heartbeat"}', err => {});
    // setInterval(ping, 5000);
  },
});

app.keys = ['some secret hurr'];
app.use(cors());
app.use(json({ pretty: false, param: 'pretty' }));
app.use(logger());
app.use(bodyParser());
app.use(convert(session(app)));
app.use(serve(__dirname + '/public'));

// Routes setup
Object.values(routes).forEach((route) => {
  app.use(route.routes());
  app.use(route.allowedMethods());
});

// app.ws.use(websocketRoutes.routes());
// app.ws.use(websocketRoutes.allowedMethods());

export default app;
