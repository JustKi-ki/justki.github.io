const POSTS_URL = 'posts.json';
const PAGE_SIZE = 5;

let posts = [];
let filtered = [];
let page = 1;
let activeTag = null;

const el = id => document.getElementById(id);

function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

function renderPosts(){
  const start = (page-1)*PAGE_SIZE;
  const pagePosts = filtered.slice(start, start+PAGE_SIZE);
  const postsEl = el('posts');
  postsEl.innerHTML = '';
  if(pagePosts.length===0){ postsEl.innerHTML = '<p>没有找到文章。</p>'; updateSummary(); return }
  for(const p of pagePosts){
    const d = document.createElement('article');
    d.className = 'post card';
    d.innerHTML = `
      <h2><a href="#post/${p.slug}" data-slug="${p.slug}">${escapeHtml(p.title)}</a></h2>
      <div class="meta"><span>${p.date}</span> • <span class="tags">${p.tags.map(t=>`<span class="tag" data-tag="${t}">${t}</span>`).join('')}</span></div>
      <p>${escapeHtml(p.excerpt)}</p>
      <p><a href="#post/${p.slug}" data-slug="${p.slug}">阅读更多 →</a></p>
    `;
    postsEl.appendChild(d);
  }
  attachTagHandlers();
  attachReadHandlers();
  updateSummary();
  updatePagination();
}

function updateSummary(){
  el('summary').textContent = `共 ${filtered.length} 篇文章，显示第 ${page} 页`;
}

function updatePagination(){
  const totalPages = Math.max(1, Math.ceil(filtered.length/PAGE_SIZE));
  el('page-info').textContent = `${page} / ${totalPages}`;
  el('prev').disabled = page<=1;
  el('next').disabled = page>=totalPages;
}

function attachTagHandlers(){
  document.querySelectorAll('.tag').forEach(t=>{
    t.onclick = e=>{ const tag = t.dataset.tag; if(activeTag===tag){ activeTag=null; } else activeTag=tag; applyFilters(); highlightActiveTag(); }
  });
}

function highlightActiveTag(){
  document.querySelectorAll('.tag').forEach(t=>{
    if(activeTag && t.dataset.tag===activeTag) t.classList.add('active'); else t.classList.remove('active');
  });
}

function attachReadHandlers(){
  document.querySelectorAll('[data-slug]').forEach(a=>{
    a.onclick = e=>{ /* allow default anchor to set hash, just prevent full navigation */ e.preventDefault(); const slug = a.dataset.slug; location.hash = `post/${slug}`; }
  });
}

function showPostBySlug(slug){
  const p = posts.find(x=>x.slug===slug);
  if(!p){ alert('文章未找到'); return }
  const container = el('post-content');
  container.innerHTML = `<h1>${escapeHtml(p.title)}</h1><div class="meta">${p.date} • ${p.tags.join(', ')}</div><div class="post-body">${p.content}</div>`;
  const view = el('post-view');
  view.classList.remove('hidden'); view.setAttribute('aria-hidden','false');
}

function closePostView(){
  const view = el('post-view');
  view.classList.add('hidden'); view.setAttribute('aria-hidden','true');
  // remove hash if it was a post hash
  if(location.hash.startsWith('#post/')) history.pushState('', document.title, location.pathname + location.search);
}

function applyFilters(){
  const q = el('search').value.trim().toLowerCase();
  filtered = posts.filter(p=>{
    if(activeTag && !p.tags.includes(activeTag)) return false;
    if(!q) return true;
    return p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.tags.join(' ').toLowerCase().includes(q);
  });
  page = 1; renderPosts(); renderRecent();
}

function renderTags(){
  const tagSet = new Set(); posts.forEach(p=>p.tags.forEach(t=>tagSet.add(t)));
  const tagsEl = el('tags'); tagsEl.innerHTML = '';
  Array.from(tagSet).sort().forEach(t=>{ const s = document.createElement('button'); s.className='tag'; s.textContent=t; s.dataset.tag=t; tagsEl.appendChild(s); });
  tagsEl.onclick = e=>{ if(e.target.dataset && e.target.dataset.tag){ activeTag = e.target.dataset.tag; applyFilters(); highlightActiveTag(); }}
}

function renderRecent(){
  const ul = el('recent'); ul.innerHTML='';
  posts.slice(0,6).forEach(p=>{ const li=document.createElement('li'); li.innerHTML=`<a href="#post/${p.slug}" data-slug="${p.slug}">${escapeHtml(p.title)}</a>`; ul.appendChild(li); });
  attachReadHandlers();
}

function setupEvents(){
  el('search').addEventListener('input', ()=>{ applyFilters(); });
  el('prev').addEventListener('click', ()=>{ if(page>1){ page--; renderPosts(); }});
  el('next').addEventListener('click', ()=>{ const max = Math.ceil(filtered.length/PAGE_SIZE); if(page<max){ page++; renderPosts(); }});

  el('theme-toggle').addEventListener('click', ()=>{
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur==='dark' ? '' : 'dark';
    if(next) document.documentElement.setAttribute('data-theme','dark'); else document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', next||'light');
  });

  el('post-close').addEventListener('click', ()=>{ closePostView(); });
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closePostView(); });
  window.addEventListener('hashchange', handleHash);
}

function handleHash(){
  const h = location.hash.replace(/^#/, '');
  if(h.startsWith('post/')){ const slug = h.split('/')[1]; showPostBySlug(slug); } else { closePostView(); }
}

function restoreTheme(){
  const t = localStorage.getItem('theme'); if(t==='dark') document.documentElement.setAttribute('data-theme','dark');
}

async function init(){
  restoreTheme();
  setupEvents();
  try{
    const res = await fetch(POSTS_URL);
    posts = await res.json();
  }catch(e){ console.error('加载文章失败', e); posts = []; }
  // normalize and sort by date (newest first)
  posts = posts.map(p=>({ tags:p.tags||[], excerpt:p.excerpt||'', content:p.content||'', title:p.title||'未命名', date:p.date||'', slug:p.slug||('post-'+(Math.random()*1e6|0)) })).sort((a,b)=> (b.date||'').localeCompare(a.date||''));
  filtered = posts.slice();
  renderTags();
  renderPosts();
  renderRecent();
  // if page loaded with a post hash, open it
  handleHash();
}

init();
