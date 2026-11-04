// Sessione studente, valida solo nella scheda corrente. Nessuna password viene memorizzata.
const FUTURA_BASE = 'https://pkkhpqdnotaczlgqqvhc.supabase.co';
const FUTURA_PUBLIC_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBra2hwcWRub3RhY3psZ3FxdmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MTE0NzcsImV4cCI6MjEwOTM4NzQ3N30.me538xOp2JmNWcDD2Ykc6FvmpHYq_gmhZDxyGbmPWv8';
const FuturaAuth = {
 read(){try{return JSON.parse(sessionStorage.getItem('futura-studente')||'null')}catch{return null}},
 save(session,username){sessionStorage.setItem('futura-studente',JSON.stringify({access_token:session.access_token,refresh_token:session.refresh_token,expires_at:Date.now()+(session.expires_in||3600)*1000,username}))},
 clear(){sessionStorage.removeItem('futura-studente')},
 async getToken(){let s=this.read();if(!s||!s.access_token)return null;if(s.expires_at>Date.now()+60000)return s.access_token;try{const r=await fetch(FUTURA_BASE+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:FUTURA_PUBLIC_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})});const data=await r.json();if(!r.ok||!data.access_token)throw new Error();this.save(data,s.username);return data.access_token}catch{this.clear();return null}},
 async signIn(username,password){username=username.trim().toLowerCase();if(!/^[a-z0-9_-]{4,20}$/.test(username))throw new Error('Controlla il nome utente.');const r=await fetch(FUTURA_BASE+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:FUTURA_PUBLIC_KEY,'Content-Type':'application/json'},body:JSON.stringify({email:username+'@accessi.listafutura.invalid',password})});let data;try{data=await r.json()}catch{throw new Error('Impossibile accedere. Riprova.')}if(!r.ok||!data.access_token)throw new Error('Nome utente o password non corretti.');this.save(data,username);return username}
};
