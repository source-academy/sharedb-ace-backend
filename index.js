const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const websocket = require('koa-easy-ws');
const WebSocketJSONStream = require('@teamwork/websocket-json-stream');
const ShareDB = require('sharedb');
const uuid = require('uuid').v4;

const COLLECTION_NAME = 'sa';

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

app.use(cors());
app.use(websocket());
app.use(bodyParser({ enableTypes: ['json', 'text'], strict: false }));
app.use(async (ctx) => {
  if (ctx.method === 'POST' && ctx.path === '/') {
    const contents = isEmptyObject(ctx.request.body) ? '' : ctx.request.body;
    const docId = uuid();
    const doc = db.connect(undefined, docId).get(COLLECTION_NAME, docId);
    await new Promise((resolve, reject) => {
      doc.create(contents, (err) => {
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

  if (ctx.ws) {
    const ws = new WebSocketJSONStream(await ctx.ws());
    db.listen(ws, docId);
  } else {
    ctx.body = 'Document exists.';
    ctx.set('Upgrade', 'WebSocket');
    ctx.set('Connection', 'Upgrade');
  }
});

app.listen(process.env.PORT || 8080);

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}
