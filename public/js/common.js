const RestoHub = (() => {
  const overrideStyles = document.createElement('link');
  overrideStyles.rel = 'stylesheet';
  overrideStyles.href = '/css/overrides.css';
  document.head.append(overrideStyles);
  const icons = {
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></svg>',
    view: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 10v6M14 10v6"/></svg>'
  };
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c]));
  const query = name => new URLSearchParams(location.search).get(name);
  const api = async (url, options = {}) => {
    const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(body.error || 'Unable to complete this request.'), { fields: body.errors || {}, status: response.status });
    return body;
  };
  const date = value => value ? new Intl.DateTimeFormat('en-US', { year:'numeric', month:'short', day:'numeric' }).format(new Date(value)) : 'Not available';
  function logo() { return '<a class="brand" href="/" aria-label="RestoHub home"><span class="brand-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v7M4 3v5c0 2 1.3 3 3 3s3-1 3-3V3M7 11v10M16 3v18M16 3c3 2 4 5 4 8h-4"/></svg></span><span><b>Resto</b><em>Hub</em></span></a>'; }
  function header() {
    const page = document.body.dataset.page;
    const el = document.createElement('header');
    el.className = 'site-header';
    el.innerHTML = `<div class="nav-shell">${logo()}<nav id="main-nav" aria-label="Main navigation"><a class="${page==='home'?'active':''}" href="/">Home</a><a class="${page==='restaurants'?'active':''}" href="/restaurants.html">Restaurants</a><a class="${page==='about'?'active':''}" href="/about.html">About</a></nav><div class="nav-actions"><button class="icon-button nav-search" aria-label="Open search">${icons.search}</button><button class="menu-button" aria-label="Toggle menu" aria-expanded="false"><span></span><span></span><span></span></button></div></div><form class="nav-search-panel" role="search"><div class="nav-search-inner"><label class="search-box">${icons.search}<input name="search" maxlength="100" placeholder="Search restaurants..." aria-label="Search restaurants"></label><button class="button button-primary" type="submit">Search</button><button class="icon-button search-close" type="button" aria-label="Close search">×</button></div></form>`;
    document.body.prepend(el);
    el.querySelector('.nav-search').onclick = () => { el.classList.add('searching'); el.querySelector('input').focus(); };
    el.querySelector('.search-close').onclick = () => el.classList.remove('searching');
    el.querySelector('.menu-button').onclick = e => { const open = el.classList.toggle('menu-open'); e.currentTarget.setAttribute('aria-expanded', open); };
    el.querySelector('.nav-search-panel').onsubmit = e => { e.preventDefault(); const value = new FormData(e.currentTarget).get('search').trim(); location.href = `/restaurants.html${value ? `?search=${encodeURIComponent(value)}` : ''}`; };
  }
  function footer() {
    const el = document.createElement('footer'); el.className='site-footer';
    el.innerHTML=`<div class="footer-main"><div>${logo()}<p>Restaurant Directory &amp; Database Management System</p></div><nav aria-label="Footer navigation"><a href="/">Home</a><a href="/restaurants.html">Restaurants</a><a href="/about.html">About</a></nav></div><div class="footer-bottom">© 2026 RestoHub. All rights reserved.</div>`;
    document.body.append(el);
  }
  function toast(message, kind='success') { const el=document.createElement('div'); el.className=`toast ${kind}`; el.setAttribute('role','status'); el.textContent=message; document.body.append(el); requestAnimationFrame(()=>el.classList.add('show')); setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),250)},3500); }
  function consumeFlash() { const p=new URLSearchParams(location.search); const m=p.get('message'); if(m){toast(m);p.delete('message');history.replaceState({},'',`${location.pathname}${p.size?'?'+p:''}`)} }
  function gradeClass(grade){ return ['A','B','C'].includes(grade) ? `grade-${grade.toLowerCase()}` : 'grade-none'; }
  function restaurantCard(r, quality=false){return `<article class="restaurant-card"><div class="card-top"><span class="eyebrow">${esc(r.cuisine)}</span><span class="grade-badge ${gradeClass(r.currentGrade)}">${esc(r.currentGrade)}</span></div><h3>${esc(r.name)}</h3><p class="location">${icons.pin}${esc(r.borough)}</p><div class="card-foot"><span>${quality?'Avg. score':'Score'} <strong>${esc(quality?r.averageScore:r.currentScore)}</strong></span><a href="/restaurant-details.html?id=${encodeURIComponent(r._id)}">View Details ${icons.arrow}</a></div></article>`}
  document.addEventListener('DOMContentLoaded',()=>{header();footer();consumeFlash();});
  return { api, esc, query, date, icons, toast, gradeClass, restaurantCard };
})();
const RestoHub = (() => {
  const overrideStyles = document.createElement('link');
  overrideStyles.rel = 'stylesheet';
  overrideStyles.href = '/css/overrides.css';
  document.head.append(overrideStyles);
  const icons = {
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></svg>',
    view: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 10v6M14 10v6"/></svg>'
  };
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c]));
  const query = name => new URLSearchParams(location.search).get(name);
  const api = async (url, options = {}) => {
    const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(body.error || 'Unable to complete this request.'), { fields: body.errors || {}, status: response.status });
    return body;
  };
  const date = value => value ? new Intl.DateTimeFormat('en-US', { year:'numeric', month:'short', day:'numeric' }).format(new Date(value)) : 'Not available';
  function logo() { return '<a class="brand" href="/" aria-label="RestoHub home"><span class="brand-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v7M4 3v5c0 2 1.3 3 3 3s3-1 3-3V3M7 11v10M16 3v18M16 3c3 2 4 5 4 8h-4"/></svg></span><span><b>Resto</b><em>Hub</em></span></a>'; }
  function header() {
    const page = document.body.dataset.page;
    const el = document.createElement('header');
    el.className = 'site-header';
    el.innerHTML = `<div class="nav-shell">${logo()}<nav id="main-nav" aria-label="Main navigation"><a class="${page==='home'?'active':''}" href="/">Home</a><a class="${page==='restaurants'?'active':''}" href="/restaurants.html">Restaurants</a><a class="${page==='about'?'active':''}" href="/about.html">About</a></nav><div class="nav-actions"><button class="icon-button nav-search" aria-label="Open search">${icons.search}</button><button class="menu-button" aria-label="Toggle menu" aria-expanded="false"><span></span><span></span><span></span></button></div></div><form class="nav-search-panel" role="search"><div class="nav-search-inner"><label class="search-box">${icons.search}<input name="search" maxlength="100" placeholder="Search restaurants..." aria-label="Search restaurants"></label><button class="button button-primary" type="submit">Search</button><button class="icon-button search-close" type="button" aria-label="Close search">×</button></div></form>`;
    document.body.prepend(el);
    el.querySelector('.nav-search').onclick = () => { el.classList.add('searching'); el.querySelector('input').focus(); };
    el.querySelector('.search-close').onclick = () => el.classList.remove('searching');
    el.querySelector('.menu-button').onclick = e => { const open = el.classList.toggle('menu-open'); e.currentTarget.setAttribute('aria-expanded', open); };
    el.querySelector('.nav-search-panel').onsubmit = e => { e.preventDefault(); const value = new FormData(e.currentTarget).get('search').trim(); location.href = `/restaurants.html${value ? `?search=${encodeURIComponent(value)}` : ''}`; };
  }
  function footer() {
    const el = document.createElement('footer'); el.className='site-footer';
    el.innerHTML=`<div class="footer-main"><div>${logo()}<p>Restaurant Directory &amp; Database Management System</p></div><nav aria-label="Footer navigation"><a href="/">Home</a><a href="/restaurants.html">Restaurants</a><a href="/about.html">About</a></nav></div><div class="footer-bottom">© 2026 RestoHub. All rights reserved.</div>`;
    document.body.append(el);
  }
  function toast(message, kind='success') { const el=document.createElement('div'); el.className=`toast ${kind}`; el.setAttribute('role','status'); el.textContent=message; document.body.append(el); requestAnimationFrame(()=>el.classList.add('show')); setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),250)},3500); }
  function consumeFlash() { const p=new URLSearchParams(location.search); const m=p.get('message'); if(m){toast(m);p.delete('message');history.replaceState({},'',`${location.pathname}${p.size?'?'+p:''}`)} }
  function gradeClass(grade){ return ['A','B','C'].includes(grade) ? `grade-${grade.toLowerCase()}` : 'grade-none'; }
  function restaurantCard(r, quality=false){return `<article class="restaurant-card"><div class="card-top"><span class="eyebrow">${esc(r.cuisine)}</span><span class="grade-badge ${gradeClass(r.currentGrade)}">${esc(r.currentGrade)}</span></div><h3>${esc(r.name)}</h3><p class="location">${icons.pin}${esc(r.borough)}</p><div class="card-foot"><span>${quality?'Avg. score':'Score'} <strong>${esc(quality?r.averageScore:r.currentScore)}</strong></span><a href="/restaurant-details.html?id=${encodeURIComponent(r._id)}">View Details ${icons.arrow}</a></div></article>`}
  document.addEventListener('DOMContentLoaded',()=>{header();footer();consumeFlash();});
  return { api, esc, query, date, icons, toast, gradeClass, restaurantCard };
})();
