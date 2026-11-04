// Numero di contatto pubblico per le maglie: inserire il prefisso internazionale, ad esempio +391234567890.
const NUMERO_CONTATTO = '';
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let filter = 'Tutte';
let notes;
try { notes = JSON.parse(localStorage.getItem('futura-notes') || '[]'); if (!Array.isArray(notes)) notes = []; } catch { notes = []; }
const demoNotes = [{id:'demo1',subject:'Italiano',title:'I tuoi appunti di italiano',demo:true},{id:'demo2',subject:'Latino',title:'I tuoi appunti di latino',demo:true},{id:'demo3',subject:'Matematica',title:'I tuoi appunti di matematica',demo:true}];
function renderNotes() {
 const all = [...notes, ...demoNotes].filter(n => filter === 'Tutte' || n.subject === filter);
 $('#noteGrid').innerHTML = all.length ? all.map(n => `<article class="note-card"><div class="note-top"><span class="note-subject">${escapeHTML(n.subject)}</span><span class="note-icon">${n.demo ? '01' : '↗'}</span></div><h3>${escapeHTML(n.title)}</h3><p>${n.demo ? 'ESEMPIO · Aggiungi il tuo primo file' : escapeHTML(n.filename)}</p>${!n.demo ? `<div class="note-actions"><a href="${n.data}" download="${escapeHTML(n.filename)}">Scarica ↓</a><button data-delete="${escapeHTML(n.id)}">Elimina</button></div>` : ''}</article>`).join('') : '<div class="empty-state">Nessun appunto in questa materia. Aggiungine uno tu.</div>';
 $$('[data-delete]').forEach(b => b.onclick = () => { notes = notes.filter(n => n.id !== b.dataset.delete); localStorage.setItem('futura-notes', JSON.stringify(notes)); renderNotes(); toast('Appunto eliminato'); });
}
$$('.filter').forEach(b => b.onclick = () => { $$('.filter').forEach(x => x.classList.remove('active')); b.classList.add('active'); filter = b.dataset.filter; renderNotes(); });
$$('.product').forEach(product => product.querySelectorAll('[data-side]').forEach(btn => btn.onclick = () => { product.querySelectorAll('[data-side]').forEach(b => b.classList.remove('active')); btn.classList.add('active'); const img = product.querySelector('img'); img.src = `assets/maglia-${product.dataset.product}-${btn.dataset.side}.jpg`; img.alt = `Maglia Lista Futura modello ${product.dataset.product}, ${btn.dataset.side === 'fronte' ? 'prima' : 'seconda'} vista`; }));
$('#menuButton').onclick = () => { const nav = $('#mobileNav'); nav.classList.toggle('open'); $('#menuButton').setAttribute('aria-expanded', nav.classList.contains('open')); };
$$('#mobileNav a').forEach(a => a.onclick = () => { $('#mobileNav').classList.remove('open'); $('#menuButton').setAttribute('aria-expanded','false'); });
function openModal() { $('#overlay').classList.add('visible'); $('#noteModal').classList.add('open'); $('#noteModal').setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; $('#noteTitle').focus(); }
function closeModal() { $('#overlay').classList.remove('visible'); $('#noteModal').classList.remove('open'); $('#noteModal').setAttribute('aria-hidden','true'); document.body.style.overflow=''; $('#addNote').focus(); }
$('#addNote').onclick = openModal; $('#closeModal').onclick = closeModal; $('#overlay').onclick = closeModal; document.addEventListener('keydown', e => { if(e.key === 'Escape' && $('#noteModal').classList.contains('open')) closeModal(); });
$('#noteForm').onsubmit = e => { e.preventDefault(); const file = $('#noteFile').files[0]; if (!file) return; if (file.size > 1.5 * 1024 * 1024) { toast('Il file supera il limite di 1,5 MB'); return; } const reader = new FileReader(); reader.onload = () => { const note = {id:Date.now().toString(),title:$('#noteTitle').value.trim(),subject:$('#noteSubject').value,filename:file.name,data:reader.result}; if (!note.title) return; try { const updated = [note,...notes]; localStorage.setItem('futura-notes',JSON.stringify(updated)); notes=updated; filter='Tutte'; $$('.filter').forEach(b => b.classList.toggle('active',b.dataset.filter==='Tutte')); renderNotes(); e.target.reset(); closeModal(); toast('Appunto salvato su questo dispositivo'); } catch { toast('Spazio insufficiente sul dispositivo'); } }; reader.readAsDataURL(file); };
let timer; function toast(t) { $('#toast').textContent=t; $('#toast').classList.add('show'); clearTimeout(timer); timer=setTimeout(() => $('#toast').classList.remove('show'),3000); }
if (NUMERO_CONTATTO.trim()) { const phone=$('#phoneContact'); phone.href='tel:'+NUMERO_CONTATTO.replace(/[^+0-9]/g,''); phone.innerHTML='CONTATTACI AL '+escapeHTML(NUMERO_CONTATTO)+' <span>↗</span>'; phone.removeAttribute('aria-disabled'); phone.classList.remove('unavailable'); }
renderNotes();
