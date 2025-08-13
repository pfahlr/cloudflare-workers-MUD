import { loadUniverse, Universe } from './universe.js';
import { handleCommand, initialState, PlayerState } from './game.js';

export interface Env {
  PLAYER_STATE: DurableObjectNamespace;
}

const INDEX_HTML = `<!DOCTYPE html>
<html><body>
<pre id="out"></pre>
<input id="cmd" autocomplete="off" />
<script type="module">
const out = document.getElementById('out');
const input = document.getElementById('cmd');
async function send(cmd){
  const res = await fetch('/command', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({command: cmd})});
  const text = await res.text();
  out.textContent += '\n> '+cmd+'\n'+text;
}
input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ send(input.value); input.value=''; }});
</script>
</body></html>`;

let universePromise: Promise<Universe> | undefined;

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (url.pathname === '/') {
      return new Response(INDEX_HTML, { headers: { 'content-type': 'text/html' } });
    }
    if (url.pathname === '/command' && request.method === 'POST') {
      let sid = getCookie(request.headers.get('Cookie'), 'sid');
      if (!sid) sid = crypto.randomUUID();
      const id = env.PLAYER_STATE.idFromName(sid);
      const stub = env.PLAYER_STATE.get(id);
      const resp = await stub.fetch(request);
      if (!getCookie(request.headers.get('Cookie'), 'sid')) {
        resp.headers.append('Set-Cookie', `sid=${sid}; Path=/`);
      }
      return resp;
    }
    return new Response('Not found', { status: 404 });
  }
};

function getCookie(cookie: string | null, name: string): string | null {
  if (!cookie) return null;
  const m = cookie.match(new RegExp('(?:^|; )' + name + '=([^;]+)'));
  return m ? m[1] : null;
}

export class PlayerStateDO {
  private universe!: Universe;
  constructor(private state: DurableObjectState, private env: Env) {}

  async fetch(request: Request) {
    if (!universePromise) universePromise = loadUniverse();
    this.universe = await universePromise;
    let player = await this.state.storage.get<PlayerState>('state');
    if (!player) {
      player = initialState(this.universe);
    }
    const { command } = await request.json();
    const [output, newState] = handleCommand(this.universe, player, command);
    await this.state.storage.put('state', newState);
    return new Response(output);
  }
}
