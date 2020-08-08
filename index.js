const Koa = require('koa');
const websocket = require('koa-easy-ws');
const WebSocketJSONStream = require('@teamwork/websocket-json-stream');
const ShareDB = require('sharedb');
const uuid = require('uuid').v4;

const COLLECTION_NAME = 'sa';
const INITIAL_CONTENTS = '// Type your program in here!';

const app = new Koa();
const db = new ShareDB();

db.use('connect', (ctx, done) => {
  // use custom to store the allowed document ID
  ctx.agent.custom = ctx.req;
  done();
});
db.use('submit', (ctx, done) => {
  const allowed = ctx.collection === COLLECTION_NAME && ctx.id === ctx.agent.custom;
  done(allowed ? undefined : 'Cannot write to this document');
});
db.use('readSnapshots', (ctx, done) => {
  const allowed =
    ctx.collection === COLLECTION_NAME &&
    !ctx.snapshots.find((snapshot) => snapshot.id !== ctx.agent.custom);
  done(allowed ? undefined : 'Cannot read these document(s)');
});

const documents = new Set();

app.use(websocket());
app.use(async (ctx) => {
  if (ctx.method === 'POST' && ctx.path === '/') {
    const docId = uuid();
    const doc = db.connect().get(COLLECTION_NAME, docId);
    await new Promise((resolve, reject) => {
      doc.create(INITIAL_CONTENTS, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    documents.add(docId);
    ctx.body = docId;
    return;
  }

  const docId = ctx.path.substr(1);
  if (!documents.has(docId)) {
    ctx.status = 404;
    return;
  }

  if (ctx.method !== 'GET') {
    ctx.status = 405;
    return;
  }

  if (!ctx.ws) {
    ctx.status = 426;
    ctx.set('Upgrade', 'WebSocket');
    ctx.set('Connection', 'Upgrade');
    return;
  }

  const ws = new WebSocketJSONStream(await ctx.ws());
  db.listen(ws, docId);
});

app.listen(8080);
