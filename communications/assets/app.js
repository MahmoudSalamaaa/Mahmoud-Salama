
(()=>{const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const theme=get("communications-theme",matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");document.documentElement.dataset.theme=theme;
$("#themeToggle")?.addEventListener("click",()=>{const n=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=n;set("communications-theme",n)});
const side=$("#side"),overlay=$("#overlay");const menu=o=>{side?.classList.toggle("open",o);overlay?.classList.toggle("show",o)};$("#menuBtn")?.addEventListener("click",()=>menu(!side.classList.contains("open")));overlay?.addEventListener("click",()=>menu(false));
const search=$("#search"),cards=$$(".scenario-card"),filters=$$(".filter");let category="All";
function filter(){if(!cards.length)return;const q=(search?.value||"").trim().toLowerCase();let shown=0;cards.forEach(c=>{const okCat=category==="All"||c.dataset.category===category;const okQ=!q||c.textContent.toLowerCase().includes(q);c.classList.toggle("hidden",!(okCat&&okQ));if(okCat&&okQ)shown++});$("#resultCount").textContent=`${shown} scenarios`;}
search?.addEventListener("input",filter);filters.forEach(b=>b.addEventListener("click",()=>{category=b.dataset.filter;filters.forEach(x=>x.classList.toggle("active",x===b));filter()}));filter();
const note=$("#scenarioNote");if(note){const key="communication-note-"+note.dataset.id;note.value=get(key,"");$("#saveNote").addEventListener("click",()=>{set(key,note.value);const b=$("#saveNote");b.textContent="Saved";setTimeout(()=>b.textContent="Save note",1200)})}
$("#printBtn")?.addEventListener("click",()=>print());
})();
