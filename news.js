(() => {
 const BASE='https://pkkhpqdnotaczlgqqvhc.supabase.co';
 const KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBra2hwcWRub3RhY3psZ3FxdmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MTE0NzcsImV4cCI6MjEwOTM4NzQ3N30.me538xOp2JmNWcDD2Ykc6FvmpHYq_gmhZDxyGbmPWv8';
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function safeImage(src){return typeof src==='string' && (/^assets\/[a-z0-9-]+\.jpg$/i.test(src)||src.startsWith(BASE+'/storage/v1/object/public/futura-novita/'))?src:''}
 async function load(){for(const grid of document.querySelectorAll('[data-news-grid]')){try{const limit=grid.dataset.newsLimit?'&limit='+encodeURIComponent(grid.dataset.newsLimit):'';const r=await fetch(BASE+'/rest/v1/futura_novita?select=id,titolo,testo,etichetta,immagine,ordine&order=ordine.desc,creato_il.desc'+limit,{headers:{apikey:KEY,Authorization:'Bearer '+KEY}});if(!r.ok)throw new Error();const rows=await r.json();grid.innerHTML=rows.length?rows.map(n=>{let img=safeImage(n.immagine);return `<article>${img?`<img src="${esc(img)}" alt="" loading="lazy">`:'<div class="news-placeholder" aria-hidden="true">LF</div>'}<div><span>${esc(n.etichetta)}</span><h3>${esc(n.titolo)}</h3><p>${esc(n.testo)}</p></div></article>`}).join(''):'<div class="empty-state">Non ci sono ancora novità.</div>'}catch{grid.innerHTML='<div class="empty-state">Non riusciamo a caricare le novità. Riprova più tardi.</div>'}}}
 load();
})();
