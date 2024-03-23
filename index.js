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
  // use custom to store the allowed document ID and readOnly setting
  ctx.agent.custom = ctx.req;
  done();
});
db.use('submit', (ctx, done) => {
  const allowed =
    ctx.collection === COLLECTION_NAME &&
    ctx.id === ctx.agent.custom.docId &&
    !ctx.agent.custom.readOnly;
  done(allowed ? undefined : 'Cannot write to this document');
});
db.use('readSnapshots', (ctx, done) => {
  const allowed =
    ctx.collection === COLLECTION_NAME &&
    !ctx.snapshots.find((snapshot) => snapshot.id !== ctx.agent.custom.docId);
  done(allowed ? undefined : 'Cannot read these document(s)');
});

const documents = new Map();

app.use(cors());
app.use(websocket());
app.use(bodyParser({ enableTypes: ['json', 'text'], strict: false }));
app.use(async (ctx) => {
  if (ctx.method === 'POST' && ctx.path === '/') {
    const { contents } = ctx.request.body;

    // Creates various IDs
    const docId = uuid();
    const sessionEditingId = generateShortId();
    documents.set(sessionEditingId, [docId, false]);
    const sessionViewingId = generateShortId();
    documents.set(sessionViewingId, [docId, true]);

    const connection = db.connect(undefined, { docId, readOnly: false });
    const doc = connection.get(COLLECTION_NAME, docId);
    await new Promise((resolve, reject) => {
      doc.create({ contents }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    ctx.body = { docId, sessionEditingId, sessionViewingId };
    return;
  }

  const sessionId = ctx.path.substr(1);
  const [docId, readOnly] = getSessionDetails(sessionId);

  if (docId === null) {
    ctx.status = 404;
    return;
  }

  if (ctx.method !== 'GET') {
    ctx.status = 405;
    return;
  }

  if (ctx.ws) {
    const ws = new WebSocketJSONStream(await ctx.ws());
    db.listen(ws, { docId, readOnly }); // docId and readOnly is passed to 'connect' middleware as ctx.req
  } else {
    ctx.body = { docId, readOnly };
  }
});

app.listen(process.env.PORT || 8080);

function getSessionDetails(sessionId) {
  const sessionDetails = documents.get(sessionId);
  return sessionDetails === undefined ? [null, null] : sessionDetails;
}

function generateShortId() {
  const id = uuid().slice(0, 6);
  if (documents.has(id)) {
    return generateShortId();
  } else {
    return id;
  }
}
