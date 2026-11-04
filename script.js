// Il numero di contatto resta facoltativo. Usare un numero pubblico con prefisso, ad esempio +39.
const NUMERO_CONTATTO = '';
// Chiave anonima pubblica: l'accesso è limitato dalle regole sul database e sui file.
const SUPABASE_URL = 'https://pkkhpqdnotaczlgqqvhc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBra2hwcWRub3RhY3psZ3FxdmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MTE0NzcsImV4cCI6MjEwOTM4NzQ3N30.me538xOp2JmNWcDD2Ykc6FvmpHYq_gmhZDxyGbmPWv8';
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const headers = {apikey:SUPABASE_ANON_KEY, Authorization:'Bearer '+SUPABASE_ANON_KEY};
let filter='Tutte', notes=[], objectUrls=[];
function renderNotes() {
 objectUrls.forEach(URL.revokeObjectURL); objectUrls=[];
 const all=notes.filter(n=>filter==='Tutte'||n.materia===filter);
 $('#noteGrid').innerHTML=all.length?all.map(n=>`<article class="note-card"><div class="note-top"><span class="note-subject">${escapeHTML(n.materia)} · ${escapeHTML(n.anno)}° ANNO</span><span class="note-icon">↗</span></div><h3>${escapeHTML(n.descrizione)}</h3><p>Appunto approvato da Lista Futura</p><div class="note-actions"><a data-note-image="${escapeHTML(n.id)}" href="#" aria-disabled="true">Caricamento foto...</a></div></article>`).join(''):'<div class="empty-state">Nessun appunto pubblicato in questa materia. Invia il primo!</div>';
 all.forEach(async n=>{
  try {
   const response=await fetch(`${SUPABASE_URL}/storage/v1/object/authenticated/futura-appunti/${encodeURIComponent(n.percorso_foto)}`,{headers});
   if(!response.ok)throw new Error('Foto non disponibile');
   const blob=await response.blob(); const link=document.querySelector(`[data-note-image="${CSS.escape(n.id)}"]`);
   if(!link)return;const url=URL.createObjectURL(blob);objectUrls.push(url);link.href=url;link.target='_blank';link.rel='noopener';link.textContent='Apri la foto ↗';link.removeAttribute('aria-disabled');
  } catch {const link=document.querySelector(`[data-note-image="${CSS.escape(n.id)}"]`);if(link)link.textContent='Foto non disponibile';}
 });
}
async function loadNotes(){
 $('#noteGrid').innerHTML='<div class="empty-state">Caricamento degli appunti...</div>';
 try {const response=await fetch(`${SUPABASE_URL}/rest/v1/futura_appunti?select=id,materia,anno,descrizione,percorso_foto,creato_il&approvato=eq.true&order=creato_il.desc`,{headers});if(!response.ok)throw new Error('not available');notes=await response.json();renderNotes();}
 catch {$('#noteGrid').innerHTML='<div class="empty-state">Non riusciamo a caricare gli appunti. Riprova più tardi.</div>';}
}
$$('.filter').forEach(b=>b.onclick=()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');filter=b.dataset.filter;renderNotes()});
$$('.product').forEach(product=>product.querySelectorAll('[data-side]').forEach(btn=>btn.onclick=()=>{product.querySelectorAll('[data-side]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const img=product.querySelector('img');img.src=`assets/maglia-${product.dataset.product}-${btn.dataset.side}.jpg`;img.alt=`Maglia Lista Futura modello ${product.dataset.product}, ${btn.dataset.side==='fronte'?'prima':'seconda'} vista`}));
$('#menuButton').onclick=()=>{const nav=$('#mobileNav');nav.classList.toggle('open');$('#menuButton').setAttribute('aria-expanded',nav.classList.contains('open'))};
$$('#mobileNav a').forEach(a=>a.onclick=()=>{$('#mobileNav').classList.remove('open');$('#menuButton').setAttribute('aria-expanded','false')});
function openModal(){$('#overlay').classList.add('visible');$('#noteModal').classList.add('open');$('#noteModal').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('#noteSubject').focus()}
function closeModal(){$('#overlay').classList.remove('visible');$('#noteModal').classList.remove('open');$('#noteModal').setAttribute('aria-hidden','true');document.body.style.overflow='';$('#addNote').focus()}
$('#addNote').onclick=openModal;$('#closeModal').onclick=closeModal;$('#overlay').onclick=closeModal;document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#noteModal').classList.contains('open'))closeModal()});
$('#noteForm').onsubmit=async e=>{e.preventDefault();const file=$('#noteFile').files[0];if(!file)return;if(file.size>3145728){toast('La foto supera il limite di 3 MB');return}if(!['image/jpeg','image/png','image/webp'].includes(file.type)){toast('Scegli una foto JPG, PNG o WebP');return}const form=new FormData();form.append('foto',file);form.append('materia',$('#noteSubject').value);form.append('anno',$('#noteYear').value);form.append('descrizione',$('#noteTitle').value.trim());const button=$('#submitNote');button.disabled=true;button.textContent='INVIO IN CORSO...';try{const res=await fetch(`${SUPABASE_URL}/functions/v1/invia-appunto`,{method:'POST',headers:{apikey:SUPABASE_ANON_KEY},body:form});const data=await res.json();if(!res.ok)throw new Error(data.error||'Invio non riuscito');e.target.reset();closeModal();toast('Foto inviata: sarà pubblicata dopo il controllo.');}catch(error){toast(error.message||'Invio non riuscito. Riprova.')}finally{button.disabled=false;button.innerHTML='INVIA PER IL CONTROLLO <span>↗</span>'}};
let timer;function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(timer);timer=setTimeout(()=>$('#toast').classList.remove('show'),5000)}
if(NUMERO_CONTATTO.trim()){const phone=$('#phoneContact');phone.href='tel:'+NUMERO_CONTATTO.replace(/[^+0-9]/g,'');phone.innerHTML='CONTATTACI AL '+escapeHTML(NUMERO_CONTATTO)+' <span>↗</span>';phone.removeAttribute('aria-disabled');phone.classList.remove('unavailable')}
loadNotes();
