import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {generateSearchMatrix,parseCSV} from '../assets/data.js';
import {MATRIX_TARGET,DATASETS} from '../assets/config.js';

const required=['index.html','search.html','dashboard.html','tracker.html','link-checker.html','sources.html','assets/app.css','assets/pages.js','data/seed.json','api/ai-search.js','api/check-link.js','manifest.webmanifest','sw.js','README.md'];
let failed=false;
for(const file of required){try{const s=await stat(resolve(file));if(!s.size)throw new Error('empty');console.log(`✓ ${file}`)}catch(error){failed=true;console.error(`✗ ${file}: ${error.message}`)}}
const matrix=generateSearchMatrix();
if(matrix.length!==MATRIX_TARGET){failed=true;console.error(`✗ matrix count ${matrix.length} != ${MATRIX_TARGET}`)}else console.log(`✓ matrix count ${matrix.length.toLocaleString()}`);
const seed=JSON.parse(await readFile(resolve('data/seed.json'),'utf8'));
for(const [key,config] of Object.entries(DATASETS)){if(!Array.isArray(seed[key])||!seed[key].length){failed=true;console.error(`✗ missing seed dataset ${key}`)}else console.log(`✓ seed ${key}: ${seed[key].length}`);try{const offline=parseCSV(await readFile(resolve('data/offline',config.file),'utf8'));if(offline.length!==config.target){failed=true;console.error(`✗ offline ${key}: ${offline.length} != ${config.target}`)}else console.log(`✓ offline ${key}: ${offline.length.toLocaleString()}`)}catch(error){failed=true;console.error(`✗ offline ${key}: ${error.message}`)}}
const html=(await readdir('.')).filter(x=>x.endsWith('.html'));
for(const file of html){const text=await readFile(file,'utf8');if(!text.includes('assets/pages.js')){failed=true;console.error(`✗ ${file} missing shared application script`)}}
if(failed)process.exit(1);console.log(`Validation complete: ${html.length} HTML pages, ${Object.keys(DATASETS).length} datasets.`)
