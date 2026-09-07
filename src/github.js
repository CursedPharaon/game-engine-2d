function b64EncodeUnicode(str){
  return btoa(unescape(encodeURIComponent(str)));
}
function b64DecodeUnicode(b64){
  return decodeURIComponent(escape(atob(b64)));
}

export async function publishToGitHub({owner, repo, token, gameSlug, htmlContent, meta}){
  const apiBase = `https://api.github.com/repos/${owner}/${repo}`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json'
  };
  // 1. check / get games.json
  let games = [];
  let gamesSha = null;
  try{
    const r = await fetch(`${apiBase}/contents/games/games.json`, {headers});
    if(r.ok){
      const j = await r.json();
      gamesSha = j.sha;
      try{ games = JSON.parse(b64DecodeUnicode(j.content.replace(/\n/g,''))); }catch{ games=[]; }
    }
  }catch(e){ /* ignore */ }

  // 2. upsert games/games.json
  const idx = games.findIndex(g=> g.slug===gameSlug);
  const now = new Date().toISOString();
  const entry = {
    slug: gameSlug,
    title: meta.title,
    author: meta.author || owner,
    description: meta.description || '',
    createdAt: idx>=0 ? games[idx].createdAt : now,
    updatedAt: now,
    path: `games/${gameSlug}/`,
    cover: meta.cover || ''
  };
  if(idx>=0) games[idx]=entry; else games.push(entry);
  const gamesJsonStr = JSON.stringify(games,null,2);
  const gamesJsonB64 = b64EncodeUnicode(gamesJsonStr);

  // PUT games.json
  let body = {
    message: `publish game ${gameSlug} — ${meta.title}`,
    content: gamesJsonB64
  };
  if(gamesSha) body.sha = gamesSha;
  let putResp = await fetch(`${apiBase}/contents/games/games.json`, {method:'PUT', headers:{...headers, 'Content-Type':'application/json'}, body: JSON.stringify(body)});
  if(!putResp.ok){
    const t=await putResp.text();
    throw new Error('Не удалось обновить games.json: '+putResp.status+' '+t);
  }

  // 3. PUT game html: games/<slug>/index.html
  // need sha if exists
  let htmlSha=null;
  try{
    const r2=await fetch(`${apiBase}/contents/games/${gameSlug}/index.html`,{headers});
    if(r2.ok){ const j2=await r2.json(); htmlSha=j2.sha; }
  }catch{}
  const htmlB64=b64EncodeUnicode(htmlContent);
  let body2={ message:`publish game html ${gameSlug}`, content: htmlB64 };
  if(htmlSha) body2.sha=htmlSha;
  let put2=await fetch(`${apiBase}/contents/games/${gameSlug}/index.html`,{method:'PUT', headers:{...headers,'Content-Type':'application/json'}, body: JSON.stringify(body2)});
  if(!put2.ok){
    const t=await put2.text();
    throw new Error('Не удалось загрузить HTML игры: '+put2.status+' '+t);
  }
  return {entry, games};
}

// helper to fetch games.json for feed (from GitHub Pages or local)
export async function fetchGamesList(){
  // try local /games/games.json relative
  const candidates = [
    './games/games.json',
    'games/games.json',
    '/games/games.json'
  ];
  // detect base from location
  const base = import.meta.env.BASE_URL || './';
  candidates.unshift(base+'games/games.json');
  for(const url of candidates){
    try{
      const r=await fetch(url, {cache:'no-store'});
      if(r.ok) return await r.json();
    }catch{}
  }
  return [];
}
