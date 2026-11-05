const ModeratoreAuth={
 read(){try{return JSON.parse(sessionStorage.getItem('futura-moderatore')||'null')}catch{return null}},
 save(s){sessionStorage.setItem('futura-moderatore',JSON.stringify({access_token:s.access_token,refresh_token:s.refresh_token,expires_at:Date.now()+(s.expires_in||3600)*1000}))},
 clear(){sessionStorage.removeItem('futura-moderatore')},
 async getToken(){let s=this.read();if(!s?.access_token)return null;if(s.expires_at>Date.now()+60000)return s.access_token;try{let r=await fetch('https://pkkhpqdnotaczlgqqvhc.supabase.co/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBra2hwcWRub3RhY3psZ3FxdmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MTE0NzcsImV4cCI6MjEwOTM4NzQ3N30.me538xOp2JmNWcDD2Ykc6FvmpHYq_gmhZDxyGbmPWv8','Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})});let data=await r.json();if(!r.ok||!data.access_token)throw new Error();this.save(data);return data.access_token}catch{this.clear();return null}}
};
