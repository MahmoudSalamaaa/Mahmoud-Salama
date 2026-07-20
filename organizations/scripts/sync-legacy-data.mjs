import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const commit='375dafd01dae682d4711deb26cb677eecc711b56';
const base=`https://raw.githubusercontent.com/MahmoudSalamaaa/Mahmoud-Salama/${commit}/organizations/`;
const files=[
  'organizations.csv','medical-companies.csv','recruitment-agencies.csv','government-jobs.csv','private-company-directory.csv',
  'egypt-vacancies.csv','gcc-vacancies.csv','remote-jobs.csv','regional-private-companies.csv','job-search-platforms.csv','project-opportunities.csv',
  'platform-search-egypt.csv','platform-search-gcc.csv','platform-search-arab.csv','platform-search-africa.csv','platform-search-remote.csv','all-platform-searches.csv',
  'mahmoud-salama-logo-optimized.png'
];
let failures=0;
for(const file of files){
  try{
    const response=await fetch(base+file);if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const buffer=Buffer.from(await response.arrayBuffer());await writeFile(resolve(file),buffer);console.log(`✓ ${file} (${buffer.length.toLocaleString()} bytes)`);
  }catch(error){failures++;console.error(`✗ ${file}: ${error.message}`)}
}
if(failures){console.error(`${failures} files could not be synchronized. The application will use the immutable remote source and bundled offline seed.`);process.exitCode=1}
