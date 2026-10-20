(function(root){
 'use strict';
 const clone=x=>JSON.parse(JSON.stringify(x));
 const status={idea:'候補',pending:'調整中',approved:'訪問了承済',confirmed:'確定',skipped:'見送り'};
 const taskStatus={todo:'未確認',pending:'調整中',done:'確認済'};
 function defaults(data){return normalize({version:1,revision:1,updated:'2026-10-19',events:clone(data.events),tasks:Object.fromEntries(data.tasks.map(t=>[t.id,{status:t.status||'todo',memo:t.memo||''}]))},data);}
 function normalize(raw,data){
  if(!raw||raw.version!==1||raw.revision!==1||!Array.isArray(raw.events)||raw.events.length>100||!raw.tasks||typeof raw.tasks!=='object')throw Error('この形式のデータは読み込めません。');
  const seen=new Set(),placeIds=new Set(['','station',...data.places.map(p=>p.id)]),peopleIds=new Set(data.people.map(p=>p.id));
  const str=(v,n,required=false)=>{if(typeof v!=='string'||v.length>n||(required&&!v.trim()))throw Error('文字数または必須項目に問題があります。');return v;};
  const events=raw.events.map(e=>{
   if(!e||!['string'].includes(typeof e.id)||!/^[a-zA-Z0-9_-]{1,80}$/.test(e.id)||seen.has(e.id))throw Error('予定のIDが重複、または無効です。');seen.add(e.id);
   if(![25,26].includes(e.day)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(e.start)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(e.end)||e.start>=e.end)throw Error('予定の日付・開始時刻・終了時刻を確認してください。');
   if(!Object.hasOwn(status,e.status)||!placeIds.has(e.place)||!Array.isArray(e.people)||e.people.length>5||e.people.some(id=>!peopleIds.has(id)))throw Error('予定の状態・訪問先・人物が無効です。');
   const n={id:e.id,day:e.day,start:e.start,end:e.end,title:str(e.title,120,true),place:e.place,people:[...new Set(e.people)],status:e.status,note:str(e.note,1600),confirmation:str(e.confirmation||'',600)};
   if(['confirmed','approved'].includes(n.status)&&!n.confirmation.trim())throw Error('確定・了承済みには、確認した内容と日付のメモが必要です。');
   if(e.mode){if(!['walking','driving'].includes(e.mode))throw Error('移動方法が無効です。');n.mode=e.mode;}
   return n;
  });
  const tasks={};for(const t of data.tasks){const v=raw.tasks[t.id]||{status:t.status||'todo',memo:t.memo||''};if(!Object.hasOwn(taskStatus,v.status))throw Error('確認事項の状態が無効です。');tasks[t.id]={status:v.status,memo:str(v.memo||'',1000)};if(v.status==='done'&&!tasks[t.id].memo.trim())throw Error('確認済みの項目には確認メモを入力してください。');}
  events.sort((a,b)=>a.day-b.day||a.start.localeCompare(b.start)||a.id.localeCompare(b.id));
  return {version:1,revision:1,updated:str(raw.updated||'',40),events,tasks};
 }
 function sorted(state,day){return state.events.filter(e=>e.day===day).sort((a,b)=>a.start.localeCompare(b.start)||a.end.localeCompare(b.end)||a.id.localeCompare(b.id));}
 function overlaps(state,day){const e=sorted(state,day).filter(x=>x.status!=='skipped'),out=[];for(let i=0;i<e.length;i++)for(let j=i+1;j<e.length;j++){if(e[j].start>=e[i].end)break;out.push([e[i],e[j]]);}return out;}
 function encode(state,data){const b=defaults(data);const payload={v:1,r:1,u:state.updated,e:state.events.filter(e=>JSON.stringify(e)!==JSON.stringify(b.events.find(x=>x.id===e.id))),d:b.events.filter(e=>!state.events.some(x=>x.id===e.id)).map(e=>e.id),t:Object.fromEntries(Object.entries(state.tasks).filter(([k,v])=>JSON.stringify(v)!==JSON.stringify(b.tasks[k])))};const bytes=new TextEncoder().encode(JSON.stringify(payload));let binary='';for(const n of bytes)binary+=String.fromCharCode(n);return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
 function decode(text,data){if(typeof text!=='string'||text.length>60000||!/^[\w-]+$/.test(text))throw Error('共有データが壊れているか、大きすぎます。');const bin=atob(text.replace(/-/g,'+').replace(/_/g,'/'));const p=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(bin,c=>c.charCodeAt(0))));if(p.v!==1||p.r!==1||!Array.isArray(p.e)||!Array.isArray(p.d)||p.e.length>100||p.d.length>100||!p.t||typeof p.t!=='object')throw Error('この共有版は読み込めません。');const b=defaults(data),ids=new Set(p.e.map(e=>e.id));b.events=b.events.filter(e=>!p.d.includes(e.id)&&!ids.has(e.id)).concat(p.e);for(const k of Object.keys(b.tasks)){if(Object.hasOwn(p.t,k))b.tasks[k]=p.t[k];}b.updated=p.u||'';return normalize(b,data);}
 root.TourCore={defaults,normalize,sorted,overlaps,encode,decode,status,taskStatus,clone};
})(typeof window!=='undefined'?window:globalThis);
