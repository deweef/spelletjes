// Controleert alle levels in blokken.html: oplosbaar en klopt 'min' (het kleinste aantal zetten)?
// Gebruik: node blokken/controleer.js
const M=require('./motor-laden.js');let fout=0;
for(const w of M.WERELDEN)for(const l of w.levels){const lv=M.maakLevel(l),r=M.los(lv);
  const ok=r.zetten!=null&&r.zetten===l.min;if(!ok)fout++;
  console.log((ok?'ok  ':'FOUT')+' '+l.id.padEnd(6)+l.naam.padEnd(22)+' min '+l.min+', oplosser '+r.zetten+' ('+lv.blokken.length+' stenen, '+r.staten+' standen)')}
// dubbele id's?
const ids=M.WERELDEN.flatMap(w=>w.levels.map(l=>l.id));if(new Set(ids).size!==ids.length){console.log('FOUT: dubbele id');fout++}
process.exit(fout?1:0);
