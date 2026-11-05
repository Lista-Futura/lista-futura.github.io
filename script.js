// Il numero di contatto resta facoltativo. Usare un numero pubblico con prefisso, ad esempio +39.
const NUMERO_CONTATTO = '';
// Chiave anonima pubblica: l'accesso è limitato dalle regole sul database e sui file.
const SUPABASE_URL = 'https://pkkhpqdnotaczlgqqvhc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBra2hwcWRub3RhY3psZ3FxdmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MTE0NzcsImV4cCI6MjEwOTM4NzQ3N30.me538xOp2JmNWcDD2Ykc6FvmpHYq_gmhZDxyGbmPWv8';
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const headers = {apikey:SUPABASE_ANON_KEY, Authorization:'Bearer '+SUPABASE_ANON_KEY};
let filter='Tutte', notes=[], objectUrls=[], noteFiles=[];
function renderNotes() {
 objectUrls.forEach(URL.revokeObjectURL); objectUrls=[];
 const all=notes.filter(n=>filter==='Tutte'||n.materia===filter);
 $('#noteGrid').innerHTML=all.length?all.map(n=>{const paths=Array.isArray(n.percorsi_foto)&&n.percorsi_foto.length?n.percorsi_foto:[n.percorso_foto];return `<article class="note-card"><div class="note-top"><span class="note-subject">${escapeHTML(n.materia)} · ${escapeHTML(n.anno)}° ANNO</span><span class="note-icon">↗</span></div><h3>${escapeHTML(n.descrizione)}</h3><p>${paths.length} ${paths.length===1?'foto approvata':'foto approvate'} da Lista Futura</p><div class="note-actions">${paths.map((_,i)=>`<a data-note-image="${escapeHTML(n.id)}-${i}" href="#" aria-disabled="true">Foto ${i+1}...</a>`).join('')}</div></article>`}).join(''):'<div class="empty-state">Nessun appunto pubblicato in questa materia. Invia il primo!</div>';
 all.forEach(n=>{const paths=Array.isArray(n.percorsi_foto)&&n.percorsi_foto.length?n.percorsi_foto:[n.percorso_foto];paths.forEach(async (path,i)=>{
  try {
   const response=await fetch(`${SUPABASE_URL}/storage/v1/object/authenticated/futura-appunti/${encodeURIComponent(path)}`,{headers});
   if(!response.ok)throw new Error('Foto non disponibile');
   const blob=await response.blob();const link=document.querySelector(`[data-note-image="${CSS.escape(n.id+'-'+i)}"]`);
   if(!link)return;const url=URL.createObjectURL(blob);objectUrls.push(url);link.href=url;link.target='_blank';link.rel='noopener';link.textContent=paths.length===1?'Apri la foto ↗':`Foto ${i+1} ↗`;link.removeAttribute('aria-disabled');
  } catch {const link=document.querySelector(`[data-note-image="${CSS.escape(n.id+'-'+i)}"]`);if(link)link.textContent=`Foto ${i+1} non disponibile`;}
 })});
}
async function loadNotes(){
 $('#noteGrid').innerHTML='<div class="empty-state">Caricamento degli appunti...</div>';
 try {const response=await fetch(`${SUPABASE_URL}/rest/v1/futura_appunti?select=id,materia,anno,descrizione,percorso_foto,percorsi_foto,creato_il&approvato=eq.true&order=creato_il.desc`,{headers});if(!response.ok)throw new Error('not available');notes=await response.json();renderNotes();}
 catch {$('#noteGrid').innerHTML='<div class="empty-state">Non riusciamo a caricare gli appunti. Riprova più tardi.</div>';}
}
function showFiles(){
 $('#selectedFiles').innerHTML=noteFiles.length?noteFiles.map((f,i)=>`<div><span>${i+1}. ${escapeHTML(f.name)}</span><button type="button" data-remove-file="${i}" aria-label="Rimuovi foto ${i+1}">Rimuovi</button></div>`).join(''):'Nessuna foto selezionata.';
 $$('[data-remove-file]').forEach(b=>b.onclick=()=>{noteFiles.splice(Number(b.dataset.removeFile),1);showFiles()});
}
$('#noteFile').addEventListener('change',e=>{
 let ignored=false;
 for(const file of Array.from(e.target.files)){
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>3145728){ignored=true;continue}
  if(noteFiles.length>=5 || noteFiles.reduce((total,f)=>total+f.size,0)+file.size>12*1024*1024-65536){ignored=true;continue}
  if(!noteFiles.some(f=>f.name===file.name&&f.size===file.size&&f.lastModified===file.lastModified))noteFiles.push(file);
 }
 e.target.value='';showFiles();if(ignored)toast('Massimo 5 foto JPG, PNG o WebP, 3 MB ciascuna e 12 MB in totale.');
});
$$('.filter').forEach(b=>b.onclick=()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');filter=b.dataset.filter;renderNotes()});
$$('.product').forEach(product=>product.querySelectorAll('[data-side]').forEach(btn=>btn.onclick=()=>{product.querySelectorAll('[data-side]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const img=product.querySelector('img');img.src=`assets/maglia-${product.dataset.product}-${btn.dataset.side}.jpg?v=20261105b`;img.alt=`Maglia Lista Futura modello ${product.dataset.product}, ${btn.dataset.side==='fronte'?'prima':'seconda'} vista`}));
$('#menuButton').onclick=()=>{const nav=$('#mobileNav');nav.classList.toggle('open');$('#menuButton').setAttribute('aria-expanded',nav.classList.contains('open'))};
$$('#mobileNav a').forEach(a=>a.onclick=()=>{$('#mobileNav').classList.remove('open');$('#menuButton').setAttribute('aria-expanded','false')});
function openModal(){$('#overlay').classList.add('visible');$('#noteModal').classList.add('open');$('#noteModal').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('#noteSubject').focus()}
function closeModal(){$('#overlay').classList.remove('visible');$('#noteModal').classList.remove('open');$('#noteModal').setAttribute('aria-hidden','true');document.body.style.overflow='';$('#addNote').focus()}
$('#addNote').onclick=async()=>{const token=await FuturaAuth.getToken();if(!token){window.location.href='account.html?next=appunti';return}openModal()};$('#closeModal').onclick=closeModal;$('#overlay').onclick=closeModal;document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#noteModal').classList.contains('open'))closeModal()});
$('#noteForm').onsubmit=async e=>{e.preventDefault();if(!noteFiles.length){toast('Scegli almeno una foto');$('#noteFile').focus();return}const userToken=await FuturaAuth.getToken();if(!userToken){toast('Accedi per inviare gli appunti.');window.location.href='account.html?next=appunti';return}const form=new FormData();noteFiles.forEach(file=>form.append('foto',file));form.append('materia',$('#noteSubject').value);form.append('anno',$('#noteYear').value);form.append('descrizione',$('#noteTitle').value.trim());const button=$('#submitNote');button.disabled=true;button.textContent='INVIO IN CORSO...';try{const res=await fetch(`${SUPABASE_URL}/functions/v1/invia-appunto-account`,{method:'POST',headers:{apikey:SUPABASE_ANON_KEY,Authorization:'Bearer '+userToken},body:form});const data=await res.json();if(!res.ok)throw new Error(data.error||'Invio non riuscito');e.target.reset();noteFiles=[];showFiles();closeModal();toast('Foto inviate: saranno pubblicate dopo il controllo.');}catch(error){toast(error.message||'Invio non riuscito. Riprova.')}finally{button.disabled=false;button.innerHTML='INVIA PER IL CONTROLLO <span>↗</span>'}};
let timer;function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(timer);timer=setTimeout(()=>$('#toast').classList.remove('show'),5000)}
if(NUMERO_CONTATTO.trim()){const phone=$('#phoneContact');phone.href='tel:'+NUMERO_CONTATTO.replace(/[^+0-9]/g,'');phone.innerHTML='CONTATTACI AL '+escapeHTML(NUMERO_CONTATTO)+' <span>↗</span>';phone.removeAttribute('aria-disabled');phone.classList.remove('unavailable')}
loadNotes();
// Barra fissa su telefono: sezione corrente e navigazione rapida.
const sectionSelect=document.querySelector('#sectionSelect');
if(sectionSelect){
 document.body.classList.add('has-section-bar');
 const sections=Array.from(sectionSelect.options).map(o=>document.getElementById(o.value)).filter(Boolean);
 let scheduled=false;
 function currentSection(){let current='inizio';for(const section of sections){if(section.getBoundingClientRect().top<=90)current=section.id}sectionSelect.value=current;scheduled=false}
 window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(currentSection)}},{passive:true});
 sectionSelect.addEventListener('change',()=>document.getElementById(sectionSelect.value)?.scrollIntoView({behavior:'smooth',block:'start'}));currentSection();
}
