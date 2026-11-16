(() => {
 const BASE='https://pkkhpqdnotaczlgqqvhc.supabase.co';
 const KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBra2hwcWRub3RhY3psZ3FxdmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MTE0NzcsImV4cCI6MjEwOTM4NzQ3N30.me538xOp2JmNWcDD2Ykc6FvmpHYq_gmhZDxyGbmPWv8';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const lines=s=>esc(s).replace(/\n/g,'<br>');
 const LIMITE=260, ANTEPRIMA=240;
 function safeImage(src){return typeof src==='string' && (/^assets\/[a-z0-9-]+\.jpg$/i.test(src)||src.startsWith(BASE+'/storage/v1/object/public/futura-novita/'))?src:''}
 function preview(testo){const t=String(testo||'').trim();return lines(t.length>ANTEPRIMA?t.slice(0,ANTEPRIMA).trim()+'…':t)}
 async function load(){for(const grid of document.querySelectorAll('[data-news-grid]')){try{const limit=grid.dataset.newsLimit?'&limit='+encodeURIComponent(grid.dataset.newsLimit):'';const r=await fetch(BASE+'/rest/v1/futura_novita?select=id,titolo,testo,etichetta,immagine,ordine&order=ordine.desc,creato_il.desc'+limit,{headers:{apikey:KEY,Authorization:'Bearer '+KEY}});if(!r.ok)throw new Error();const rows=await r.json();const byId=new Map(rows.map(n=>[String(n.id),n]));
 grid.innerHTML=rows.length?rows.map(n=>{let img=safeImage(n.immagine);const lungo=String(n.testo||'').trim().length>LIMITE;return `<article>${img?`<img src="${esc(img)}" alt="" loading="lazy">`:'<div class="news-placeholder" aria-hidden="true">LF</div>'}<div><span>${esc(n.etichetta)}</span><h3>${esc(n.titolo)}</h3><p data-text="${esc(n.id)}">${preview(n.testo)}</p>${lungo?`<button type="button" class="news-more" data-more="${esc(n.id)}" aria-expanded="false">LEGGI TUTTO L’ARTICOLO ↗</button>`:''}</div></article>`}).join(''):'<div class="empty-state">Non ci sono ancora novità.</div>';
 grid.querySelectorAll('[data-more]').forEach(btn=>{btn.onclick=()=>{const n=byId.get(btn.dataset.more),p=grid.querySelector(`[data-text="${btn.dataset.more}"]`);if(!n||!p)return;const aperto=btn.getAttribute('aria-expanded')==='true';if(aperto){p.innerHTML=preview(n.testo);btn.setAttribute('aria-expanded','false');btn.textContent='LEGGI TUTTO L’ARTICOLO ↗'}else{p.innerHTML=lines(n.testo);btn.setAttribute('aria-expanded','true');btn.textContent='CHIUDI ARTICOLO ↗'}}});}catch{grid.innerHTML='<div class="empty-state">Non riusciamo a caricare le novità. Riprova più tardi.</div>'}}}
 load();
})();
