import Router from 'koa-router';
import share from '../db';
import uuid from 'uuid/v1';

const router = new Router();
let latest = null;
let list_id = [];
let count = 0;

async function newGist() {
  const id = uuid();
  const doc = share.connect().get('codepad', id);
  await new Promise( (resolve, reject) => {
    doc.create({
      "code": "// Type your program in here!"
    }, function(err) {
      if (err) reject(err);
      latest = id;
      list_id[count++] = id;
      resolve();
    });
  });
  console.log("In newGist(), count = " + count);
  console.log(`New session created with uuid: ${id}`);
  console.log("lastest: " + latest);
  return id;
}

// For testing only
newGist();

// Gists
router.post('/gists/new', async (ctx) => {
  const id = await newGist();
  console.log("In gists/new, count = " + count);
  ctx.body = {id};
  console.log("ctx.body.id: " + ctx.body.id);
});

router.get('/gists/latest', async (ctx) => {
  newGist();
  console.log("In gists/latest, count = " + count);
  console.log("lastest: " + latest);
  ctx.body = {id: latest};
  console.log("ctx.body.id: " + ctx.body.id);
});

router.get('/gists/:sid', async (ctx) => {
  console.log("In gists/:sid, count = " + count);
  console.log("lastest: " + latest);
  console.log(`Accessing session with uuid: ${ctx.params.sid}`);
  ctx.body = {id: ctx.params.sid};
  console.log("ctx.body.id: " + ctx.body.id);
});

export default router;
