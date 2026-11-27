// Noppenschuif levelmaker. Maakt levels door ACHTERUIT te spelen: begin met een leeg bord, schuif stenen door hun
// eigen uitgang naar binnen en hussel ze daarna door elkaar. Omdat elke stap terug te draaien is, is elk level oplosbaar.
// Daarna zoekt de oplosser het kleinste aantal zetten.
// Gebruik: node blokken/levelmaker.js '{"w":5,"h":5,"kleuren":3,"stukken":8,"min":6,"max":9,"aantal":3,"vormen":"1,2h,2v,O","zaad":1}'
const M=require('./motor-laden.js');
const VORMEN={
  '1':[[0,0]],'2h':[[0,0],[1,0]],'2v':[[0,0],[0,1]],'3h':[[0,0],[1,0],[2,0]],'3v':[[0,0],[0,1],[0,2]],
  'O':[[0,0],[1,0],[0,1],[1,1]],'L1':[[0,0],[0,1],[1,1]],'L2':[[0,0],[1,0],[0,1]],'L3':[[0,0],[1,0],[1,1]],'L4':[[1,0],[0,1],[1,1]],
  'T':[[0,0],[1,0],[2,0],[1,1]],'Tv':[[1,0],[0,1],[1,1],[1,2]],'R':[[0,0],[1,0],[0,1],[1,1],[0,2],[1,2]],'Rh':[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],
  'O3':[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1],[0,2],[1,2],[2,2]]
};
const KL=['r','b','g','n','p','o','z','w','k'];
const O=Object.assign({kleuren:2,stukken:4,min:1,max:99,aantal:3,vormen:'1,2h,2v,O,L1,L2,L3,L4',hussel:3,naHussel:40,maxStaten:600000,pogingen:3000,uitgangen:1,breedMax:3},JSON.parse(process.argv[2]||'{}'));
let zaad=(O.zaad||1)>>>0;const rnd=()=>{zaad=(zaad+0x6D2B79F5)>>>0;let t=zaad;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
const kies=a=>a[Math.floor(rnd()*a.length)];
const LETTERS='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const reden={};const telR=r=>(reden[r]=(reden[r]||0)+1,null);
function poging(){const{w,h}=O;
  const kleuren=[...KL.slice(0,Math.max(O.kleuren,1))].sort(()=>rnd()-.5).slice(0,O.kleuren);
  const uit=[],bezet={boven:[],onder:[],links:[],rechts:[]};
  for(const k of kleuren)for(let e=0;e<O.uitgangen;e++){for(let t=0;t<80;t++){const kant=kies(['boven','onder','links','rechts']),lang=(kant==='boven'||kant==='onder')?w:h;
    const len=1+Math.floor(rnd()*Math.min(O.breedMax,lang)),van=Math.floor(rnd()*(lang-len+1));
    if(bezet[kant].some(([a,b])=>!(van+len-1<a-0||van>b)))continue;bezet[kant].push([van,van+len-1]);uit.push({kant,van,tot:van+len-1,k});break}}
  if(new Set(uit.map(u=>u.k)).size<O.kleuren)return telR('uitgangen');
  // het level als lijst blokken; we bouwen een lv-object direct op
  const lv={w,h,blokken:[],uit},pos=[];const vormen=O.vormen.split(',');let mislukt=0;
  while(lv.blokken.length<O.stukken&&mislukt<200){
    const u=kies(uit),v=VORMEN[kies(vormen)],langs=(u.kant==='boven'||u.kant==='onder')?0:1,breed=Math.max(...v.map(c=>c[langs]))+1;
    if(breed>u.tot-u.van+1){mislukt++;continue}
    const vw=Math.max(...v.map(c=>c[0]))+1,vh=Math.max(...v.map(c=>c[1]))+1,s=u.van+Math.floor(rnd()*(u.tot-u.van+2-breed));
    const x=u.kant==='links'?0:u.kant==='rechts'?w-vw:s,y=u.kant==='boven'?0:u.kant==='onder'?h-vh:s;
    const i=lv.blokken.length;lv.blokken.push({id:i,k:u.k,cellen:v,x,y});pos.push(null);
    const g=M.rooster(lv,pos);  // zonder de nieuwe steen
    if(!M.vrij(lv,g,i,x,y)||!M.uitgang(lv,g,i,x,y)){lv.blokken.pop();pos.pop();mislukt++;continue}
    pos[i]=[x,y];
    // hussel: verschuif een paar willekeurige stenen naar een willekeurige bereikbare plek (geen plek waar hij meteen weg kan)
    for(let n=0;n<O.hussel;n++){const j=Math.floor(rnd()*pos.length),g2=M.rooster(lv,pos);
      const plek=M.bereik(lv,g2,j,pos[j][0],pos[j][1]).filter(([a,b])=>!M.uitgang(lv,g2,j,a,b));if(plek.length)pos[j]=kies(plek)}
    // de nieuwe steen moet nu niet meer zomaar weg kunnen? (mag wel, oplosser bepaalt de moeilijkheid)
  }
  if(lv.blokken.length<O.stukken)return telR('vol');
  // naar het eind toe nog flink husselen
  for(let n=0;n<O.naHussel;n++){const j=Math.floor(rnd()*pos.length),g2=M.rooster(lv,pos);
    const plek=M.bereik(lv,g2,j,pos[j][0],pos[j][1]).filter(([a,b])=>!M.uitgang(lv,g2,j,a,b));if(plek.length)pos[j]=kies(plek)}
  // terug naar kaart-vorm
  const kaart=Array.from({length:h},()=>Array(w).fill('.')),k={};
  lv.blokken.forEach((b,i)=>{const L=LETTERS[i];k[L]=b.k;for(const[cx,cy]of b.cellen)kaart[pos[i][1]+cy][pos[i][0]+cx]=L});
  const L={kaart:kaart.map(r=>r.join('')),k,uit};const lv2=M.maakLevel(L);
  // niet te makkelijk: hoogstens één steen kan meteen weg
  const p2=lv2.blokken.map(b=>[b.x,b.y]),g=M.rooster(lv2,p2);
  if(lv2.blokken.filter((b,i)=>M.bereik(lv2,g,i,b.x,b.y).some(([x,y])=>M.uitgang(lv2,g,i,x,y))).length>1)return telR('teMakkelijk');
  const r=M.los(lv2,O.maxStaten);if(r.zetten==null)return r.teGroot?telR('teGroot'):(console.error('FOUT: onoplosbaar?!',JSON.stringify(L)),null);
  const extra=r.zetten-lv2.blokken.length;if(r.zetten<O.min||r.zetten>O.max||extra<(O.extraMin||0)||extra>(O.extraMax??99))return telR('extra'+extra);
  L.min=r.zetten;L.extra=extra;L.staten=r.staten;return L}
// Methode 'vol': vul het hele bord met stenen (op een paar lege vakjes na) en kijk of het oplosbaar is.
function pogingVol(){const{w,h}=O;const kaart=Array.from({length:h},()=>Array(w).fill(null)),k={};
  const leeg=O.leeg||0;for(let n=0;n<leeg;n++)kaart[Math.floor(rnd()*h)][Math.floor(rnd()*w)]='.';
  const kleuren=[...KL].sort(()=>rnd()-.5).slice(0,O.kleuren),vormen=O.vormen.split(',');let n=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(kaart[y][x])continue;
    let v=null;for(let t=0;t<12&&!v;t++){const c=VORMEN[kies(vormen)],a=c.slice().sort((p,q)=>p[1]-q[1]||p[0]-q[0])[0];
      const ok=c.every(([cx,cy])=>{const X=x+cx-a[0],Y=y+cy-a[1];return X>=0&&Y>=0&&X<w&&Y<h&&!kaart[Y][X]});if(ok)v=c.map(([cx,cy])=>[x+cx-a[0],y+cy-a[1]])}
    if(!v)v=[[x,y]];const L=LETTERS[n++];if(!L)return telR('teVeel');v.forEach(([X,Y])=>kaart[Y][X]=L);k[L]=kies(kleuren)}
  if(new Set(Object.values(k)).size<O.kleuren)return telR('kleuren');
  // uitgangen: per kleur één (of meer), breed genoeg voor de smalste steen van die kleur? Nee: elke steen moet passen.
  const L0={kaart:kaart.map(r=>r.join('')),k,uit:[]},lv0=M.maakLevel(L0),bezet={boven:[],onder:[],links:[],rechts:[]},uit=[];
  for(const kl of kleuren)for(let e=0;e<O.uitgangen;e++){let gelukt=false;
    for(let t=0;t<80&&!gelukt;t++){const kant=kies(['boven','onder','links','rechts']),hor=kant==='boven'||kant==='onder',lang=hor?w:h;
      const nodig=Math.max(...lv0.blokken.filter(b=>b.k===kl).map(b=>Math.max(...b.cellen.map(c=>c[hor?0:1]))+1));
      const len=Math.min(lang,nodig+Math.floor(rnd()*2)),van=Math.floor(rnd()*(lang-len+1));
      if(bezet[kant].some(([a,b])=>!(van+len-1<a||van>b)))continue;bezet[kant].push([van,van+len-1]);uit.push({kant,van,tot:van+len-1,k:kl});gelukt=true}
    if(!gelukt)return telR('uitgangen')}
  const L={kaart:L0.kaart,k,uit};
  // kauwgomstenen: zitten vast tot er 'plak' andere stenen weg zijn
  if(O.kauwgom){L.plak={};const letters=Object.keys(k).sort(()=>rnd()-.5).slice(0,O.kauwgom);
    for(const c of letters)L.plak[c]=1+Math.floor(rnd()*(O.plakMax||2))}
  const lv2=M.maakLevel(L);
  const p2=lv2.blokken.map(b=>[b.x,b.y]),g=M.rooster(lv2,p2);
  const meteen=lv2.blokken.filter((b,i)=>M.bereik(lv2,g,i,b.x,b.y).some(([x,y])=>M.uitgang(lv2,g,i,x,y))).length;
  if(meteen<1)return telR('geenBegin');if(meteen>(O.meteenMax||2))return telR('teMakkelijk');
  const r=M.los(lv2,O.maxStaten);if(r.zetten==null)return telR(r.teGroot?'teGroot':'onoplosbaar');
  const extra=r.zetten-lv2.blokken.length;if(extra<(O.extraMin||0)||extra>(O.extraMax??99))return telR('extra'+extra);
  if(O.kauwgom){const zonder=M.los(M.maakLevel({kaart:L.kaart,k,uit}),O.maxStaten);if(zonder.zetten!=null&&zonder.zetten>=r.zetten)return telR('kauwgomZinloos')}
  L.min=r.zetten;L.extra=extra;L.staten=r.staten;return L}
// Methode 'klim': begin met een oplosbaar vol bord en verander telkens één ding (kleur van een steen, een deur verschuiven
// of verbreden, kauwgom verplaatsen). Houd de verandering als het level oplosbaar blijft en niet makkelijker wordt.
function meet(L){const lv=M.maakLevel(L),p=lv.blokken.map(b=>[b.x,b.y]),g=M.rooster(lv,p);
  // elke steen moet door een deur van zijn kleur passen
  for(const b of lv.blokken)if(!L.uit.some(u=>{if(u.k!==b.k)return false;const hor=u.kant==='boven'||u.kant==='onder';return Math.max(...b.cellen.map(c=>c[hor?0:1]))+1<=u.tot-u.van+1}))return null;
  const meteen=lv.blokken.filter((b,i)=>!M.vast(lv,p,i)&&M.bereik(lv,g,i,b.x,b.y).some(([x,y])=>M.uitgang(lv,g,i,x,y))).length;
  if(meteen<1||meteen>(O.meteenMax||2))return null;
  const r=M.los(lv,O.maxStaten);if(r.zetten==null)return null;return{min:r.zetten,extra:r.zetten-lv.blokken.length,staten:r.staten}}
function pogingKlim(){let L=null,m=null;
  for(let t=0;t<200&&!m;t++){const O2=O.extraMin;O.extraMin=0;const extraMax=O.extraMax;O.extraMax=99;const kg=O.kauwgom;O.kauwgom=0;
    L=pogingVol();O.extraMin=O2;O.extraMax=extraMax;O.kauwgom=kg;if(L){delete L.min;delete L.extra;delete L.staten;m=meet(L)}}
  if(!m)return telR('geenStart');
  if(O.kauwgom){L.plak={};}
  const kl=[...new Set(Object.values(L.k))],kanten=['boven','onder','links','rechts'];
  for(let stap=0;stap<(O.stappen||300);stap++){const N=JSON.parse(JSON.stringify(L)),r=rnd(),letters=Object.keys(N.k);
    if(r<.4){const c=kies(letters);N.k[c]=kies(kl)}
    else if(r<.75){const u=kies(N.uit),hor=u.kant==='boven'||u.kant==='onder',lang=hor?O.w:O.h,len=u.tot-u.van+1+(rnd()<.5?-1:rnd()<.5?1:0);
      if(rnd()<.3)u.kant=kies(kanten);const L2=Math.max(1,Math.min(len,(u.kant==='boven'||u.kant==='onder')?O.w:O.h,3));const lang2=(u.kant==='boven'||u.kant==='onder')?O.w:O.h;
      u.van=Math.floor(rnd()*(lang2-L2+1));u.tot=u.van+L2-1;
      if(N.uit.some(v=>v!==u&&v.kant===u.kant&&!(u.tot<v.van||u.van>v.tot)))continue}
    else if(O.kauwgom){const c=kies(letters);if(N.plak[c])delete N.plak[c];else N.plak[c]=1+Math.floor(rnd()*(O.plakMax||2));
      if(Object.keys(N.plak).length>O.kauwgom)continue}
    else continue;
    const nm=meet(N);if(!nm)continue;
    if(nm.extra>(O.extraMax??99))continue;
    if(nm.extra>=m.extra){L=N;m=nm}
    if(m.extra>=O.extraMin&&(!O.kauwgom||Object.keys(L.plak).length===O.kauwgom)&&rnd()<.15)break}
  if(m.extra<O.extraMin||m.extra>(O.extraMax??99))return telR('klimTeLaag'+m.extra);
  if(O.kauwgom){if(Object.keys(L.plak).length<O.kauwgom)return telR('teWeinigKauwgom');
    const zonder=M.los(M.maakLevel({kaart:L.kaart,k:L.k,uit:L.uit}),O.maxStaten);if(zonder.zetten!=null&&zonder.zetten>=m.min)return telR('kauwgomZinloos')}
  else delete L.plak;
  Object.assign(L,m);return L}
const toon=l=>{console.error(l.min+' zetten (extra '+l.extra+'), '+l.staten+' staten, uitgangen: '+l.uit.map(u=>u.kant+' '+u.van+'-'+u.tot+' '+u.k).join(', '));
  console.error(l.kaart.map(r=>'   '+r+'   '+[...r].map(c=>c=='.'?'.':l.k[c]).join('')).join('\n')+(l.plak?'\n   kauwgom: '+JSON.stringify(l.plak):''))};
const uit=[];for(let t=0;t<O.pogingen&&uit.length<O.aantal;t++){const L=O.methode==='klim'?pogingKlim():O.methode==='vol'?pogingVol():poging();
  if(L&&!uit.some(u=>u.kaart.join()===L.kaart.join())){uit.push(L);toon(L);require('fs').writeFileSync(O.uitvoer||'/dev/null',JSON.stringify(uit))}}
console.error('afgekeurd:',JSON.stringify(reden));console.log(JSON.stringify(uit));
