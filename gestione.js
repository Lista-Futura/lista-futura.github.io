const BASE = 'https://pkkhpqdnotaczlgqqvhc.supabase.co';
const PUBLIC_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBra2hwcWRub3RhY3psZ3FxdmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MTE0NzcsImV4cCI6MjEwOTM4NzQ3N30.me538xOp2JmNWcDD2Ykc6FvmpHYq_gmhZDxyGbmPWv8';
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let token = '';
async function action(payload){
 const res=await fetch(BASE+'/functions/v1/gestione-appunti',{method:'POST',headers:{'Content-Type':'application/json',apikey:PUBLIC_KEY,Authorization:'Bearer '+token},body:JSON.stringify(payload)});
 let data;try{data=await res.json()}catch{throw new Error('Risposta non disponibile. Riprova.')};
 if(!res.ok)throw new Error(data.error||'Operazione non riuscita');return data;
}
$('#loginForm').onsubmit=async e=>{
 e.preventDefault();const btn=e.target.querySelector('button');btn.disabled=true;$('#loginError').textContent='';
 try{const res=await fetch(BASE+'/auth/v1/token?grant_type=password',{method:'POST',headers:{'Content-Type':'application/json',apikey:PUBLIC_KEY},body:JSON.stringify({email:$('#email').value.trim(),password:$('#password').value})});const data=await res.json();if(!res.ok||!data.access_token)throw new Error('Accesso non riuscito. Verifica email e password dell’area appunti.');token=data.access_token;$('#password').value='';await load();$('#loginPanel').classList.add('hidden');$('#adminPanel').classList.remove('hidden')}
 catch(err){token='';$('#loginError').textContent=err.message||'Accesso non riuscito.'}finally{btn.disabled=false}
};
async function load(){
 $('#pendingList').innerHTML='<div class="admin-empty">Caricamento in corso...</div>';$('#adminMessage').textContent='';
 const data=await action({action:'lista'});
 $('#pendingList').innerHTML=data.appunti.length?data.appunti.map(n=>`<article class="pending-card"><div class="pending-top"><div><span>${esc(n.materia)} · ${esc(n.anno)}° ANNO · ${n.foto.length} FOTO</span><h3>${esc(n.descrizione)}</h3><p>Un solo invio: controlla tutte le foto prima di decidere.</p></div></div><div class="pending-images">${n.foto.map((url,i)=>url?`<a href="${esc(url)}" target="_blank" rel="noopener"><img src="${esc(url)}" alt="Foto ${i+1} dell’appunto"><span>APRI FOTO ${i+1} ↗</span></a>`:`<div class="missing">Foto ${i+1} non disponibile. Non approvare prima del controllo.</div>`).join('')}</div><div class="decision-actions"><button class="button black approve" type="button" data-id="${esc(n.id)}" ${n.foto.some(url=>!url)?'disabled':''}>APPROVA TUTTE LE FOTO <span>↗</span></button><label class="reason-label">Motivo della disapprovazione<select class="rejection-reason"><option value="">Scegli una motivazione</option><option>Non pertinente</option><option>Foto sfocata</option><option>Contenuto sbagliato</option><option>Foto incompleta</option><option>Contiene dati personali</option></select></label><button class="button reject" type="button" data-id="${esc(n.id)}">DISAPPROVA <span>×</span></button></div></article>`).join(''):'<div class="admin-empty">Non ci sono appunti da controllare.</div>';
 document.querySelectorAll('.approve').forEach(btn=>btn.onclick=async()=>{btn.disabled=true;try{await action({action:'approva',id:btn.dataset.id});await load();$('#adminMessage').textContent='Appunto approvato e pubblicato.'}catch(err){$('#adminMessage').textContent=err.message;btn.disabled=false}});
 document.querySelectorAll('.reject').forEach(btn=>btn.onclick=async()=>{const motivo=btn.closest('.pending-card').querySelector('.rejection-reason').value;if(!motivo){$('#adminMessage').textContent='Scegli una motivazione prima di disapprovare.';return}if(!confirm('Disapprovare questo invio? Le foto non saranno pubblicate.'))return;btn.disabled=true;try{await action({action:'rifiuta',id:btn.dataset.id,motivo});await load();$('#adminMessage').textContent='Appunto disapprovato. Motivo: '+motivo+'.'}catch(err){$('#adminMessage').textContent=err.message;btn.disabled=false}});
}
$('#reload').onclick=()=>load().catch(e=>$('#adminMessage').textContent=e.message);
$('#logout').onclick=()=>{token='';$('#pendingList').innerHTML='';$('#adminPanel').classList.add('hidden');$('#loginPanel').classList.remove('hidden')};
