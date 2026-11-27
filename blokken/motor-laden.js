// Haalt de spelregels/oplosser en de levels uit blokken.html, zodat er maar één versie van de code is.
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/../blokken.html','utf8');
const stuk=id=>html.match(new RegExp('<script id="'+id+'">([\\s\\S]*?)</script>'))[1];
module.exports=new Function(stuk('motor')+'\n'+stuk('levels')+'\nreturn {maakLevel,rooster,vrij,uitgang,bereik,los,RICHTING,WERELDEN};')();
