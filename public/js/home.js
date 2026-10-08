document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('#hero-search').addEventListener('submit', e => { e.preventDefault(); const q=new FormData(e.currentTarget).get('search').trim(); location.href=`/restaurants.html${q?'?search='+encodeURIComponent(q):''}`; });
  try {
    const [stats, recent] = await Promise.all([RestoHub.api('/api/stats'), RestoHub.api('/api/restaurants?page=1&limit=6')]);
    const values=[stats.data.restaurants,stats.data.boroughs,stats.data.cuisines,stats.data.grades];
    document.querySelectorAll('#stats .stat strong').forEach((el,i)=>el.textContent=values[i].toLocaleString());
    const grid=document.querySelector('#recent-grid');
    grid.innerHTML=recent.data.length?recent.data.map(r=>RestoHub.restaurantCard(r)).join(''):'<div class="empty-state"><h3>No restaurants found</h3><p>Add a restaurant to begin exploring.</p></div>';
    if(recent.data[0]){const r=recent.data[0];document.querySelector('#latest-inspection').innerHTML=`<span class="grade-badge ${RestoHub.gradeClass(r.currentGrade)}">${RestoHub.esc(r.currentGrade)}</span><div><small>Latest inspection · ${RestoHub.date(r.latestInspection)}</small><h3>${RestoHub.esc(r.name)}</h3><p>${RestoHub.esc(r.cuisine)} · ${RestoHub.esc(r.borough)}</p></div>`;}
  } catch(error){document.querySelector('#recent-grid').innerHTML='<div class="empty-state"><h3>Unable to load restaurant data</h3><p>Please try again.</p></div>';RestoHub.toast('Unable to load restaurant data. Please try again.','error');}
});
