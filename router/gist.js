import Router from 'koa-router';
import share from '../db';
import {v1 as uuid} from 'uuid';

const router = new Router();
const listId = new Set();

/**
 * Creates a new session.
 */
async function newGist() {
  const id = uuid();
  const doc = share.connect().get('codepad', id);
  await new Promise( (resolve, reject) => {
    doc.create({
      'code': '// Type your program in here!',
    }, function(err) {
      if (err) reject(err);
      listId.add(id);
      resolve();
    });
  });
  /* console.log('=================================');
  console.log(`New session created with uuid: ${id}`);
  console.log('In newGist(), count = ' + count);
  console.log('lastest: ' + latest); */
  return id;
}

// Statistics
router.get('/stats', async (ctx) => {
  /* console.log('=================================');
  console.log('Obtaining stats...');
  console.log('In gists/stats, count = ' + count); */
  ctx.body = {count: listId.size};
});

router.get('/gists/latest', async (ctx) => {
  const id = await newGist();
  /* console.log('=================================');
  console.log('Obtaining latest created session...');
  console.log('In gists/latest, count = ' + count); */
  ctx.body = {id: id};
});

router.get('/gists/:sid', async (ctx) => {
  const id = ctx.params.sid;
  const flag = listId.has(id);
  /* console.log('=================================');
  console.log(`Accessing session with uuid: ${ctx.params.sid}`);
  console.log('In gists/:sid, count = ' + count);
  console.log('lastest: ' + latest);
  console.log('Session fould: ' + flag); */
  ctx.body = {id: ctx.params.sid, state: flag};
});

export default router;
