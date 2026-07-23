(()=>{"use strict";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clean=s=>(s||"").replace(/\s+/g," ").trim();
const limit=(s,n=210)=>clean(s).length>n?clean(s).slice(0,n).replace(/\s+\S*$/,"")+"…":clean(s);
const stop=new Set("about after again also because been before being between both can child condition could does done during each from have into just more most must need only other over parent patient same should some such than that their them then there these they this through under very what when where which while will with would your you are was were has had not and the for".split(" "));
const preferred=["diagnosis","management","treatment","monitoring","follow-up","prognosis","complications","risk","benefits","consent","investigations","support","safety-netting","empathy","apology","confidentiality","multidisciplinary","procedure","medication","symptoms","causes","outcome","education","communication"];
function keywords(title,text){
  const words=(title+" "+text).toLowerCase().match(/[a-z][a-z-]{3,}/g)||[],freq={};
  words.forEach(w=>{if(!stop.has(w))freq[w]=(freq[w]||0)+1});
  const chosen=[];
  preferred.forEach(w=>{if(freq[w]&&chosen.length<8)chosen.push(w)});
  Object.entries(freq).sort((a,b)=>b[1]-a[1]).forEach(([w])=>{if(chosen.length<14&&!chosen.includes(w))chosen.push(w)});
  return chosen;
}
function pick(nodes,pattern,max){
  const out=[];
  nodes.forEach(n=>{const t=clean(n.textContent);if(t.length>25&&pattern.test(t)&&!out.some(x=>x===t))out.push(t)});
  return out.slice(0,max).map(x=>limit(x,190));
}
function defaults(category){
 const map={
 "Breaking Bad News":["Use a warning shot and one clear headline.","Pause, acknowledge emotion, and offer realistic hope.","Explain next steps, support, and follow-up."],
 "Medical Errors":["Secure immediate patient safety first.","Disclose verified facts and apologise clearly.","Explain investigation, learning, documentation, and support."],
 "Consent":["Explain indication, alternatives, benefits, and material risks.","Cover preparation, procedure, recovery, and complications.","Check capacity, voluntariness, and understanding."],
 "Education":["Agree learning needs and use a two-way structure.","Organise the explanation from definition to management.","Check understanding and invite questions."],
 "Ethics":["Clarify the competing duties and immediate safety concern.","Protect confidentiality and avoid judgement.","Escalate through appropriate professional channels."],
 "Information Giving":["Explore prior knowledge and preferred detail.","Use chunk-and-check with plain language.","Close with teach-back, safety-netting, and follow-up."]
 };return map[category]||map["Information Giving"];
}
function init(){
 const hero=$(".scenario-hero"),original=$(".source-content");if(!hero||!original||$(".study-hub"))return;
 $(".study-console")?.remove();
 const title=clean($("h1",hero)?.textContent),category=clean($(".eyebrow",hero)?.textContent),summary=clean($(".summary")?.textContent||$("p",hero)?.textContent);
 const sourceNodes=$$("p,li,h3",original),sourceText=clean(original.textContent),keys=keywords(title,sourceText);
 let management=pick(sourceNodes,/\b(manage|management|treat|treatment|plan|monitor|follow.?up|refer|support|advice|explain|reassure|team|investigat)/i,6);
 let alerts=pick(sourceNodes,/\b(red flag|warning|urgent|emergency|complication|risk|danger|deteriorat|bleed|infection|collapse|death|unwell|seek medical)/i,5);
 if(!management.length)management=defaults(category);
 if(!alerts.length)alerts=["Identify clinical deterioration or immediate safety concerns.","Give a clear route for urgent help and reassessment.","Document uncertainty and arrange appropriate follow-up."];
 const gold=defaults(category);
 const hub=document.createElement("section");hub.className="study-hub";hub.innerHTML=`
 <nav class="study-hub__nav" aria-label="Scenario study sections"><a href="#quick-brief">Quick brief</a><a href="#key-terms">Key terms</a><a href="#management-strategy">Management</a><a href="#red-flags">Red flags</a><a href="#source-evidence">Original source</a></nav>
 <section class="study-brief" id="quick-brief">
  <div class="study-brief__head"><div><span class="study-kicker">${esc(category)} · High-yield study view</span><h2>${esc(title)}</h2><p class="study-brief__lead">${esc(summary)}</p></div><span class="source-status"><i></i>Source preserved</span></div>
  <div class="keyword-section" id="key-terms"><h3>Essential keywords</h3><div class="keywords">${keys.map(k=>`<button class="keyword" data-key="${esc(k)}">${esc(k)}</button>`).join("")}</div></div>
  <div class="brief-grid">
   <article class="brief-card brief-card--core"><div class="brief-card__label"><span>01</span><h3>Core idea</h3></div><p>${esc(summary)}</p></article>
   <article class="brief-card brief-card--management" id="management-strategy"><div class="brief-card__label"><span>02</span><h3>Management & communication strategy</h3></div><ul class="brief-list">${management.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></article>
   <article class="brief-card brief-card--alerts" id="red-flags"><div class="brief-card__label"><span>03</span><h3>Red flags & common pitfalls</h3></div><ul class="brief-list">${alerts.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></article>
   <article class="brief-card brief-card--gold"><div class="brief-card__label"><span>04</span><h3>Golden practical points</h3></div><ul class="brief-list">${gold.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></article>
  </div>
 </section>
 <details class="source-evidence" id="source-evidence"><summary><span class="evidence-title"><span class="evidence-icon">SRC</span><span><b>Original Source Evidence</b><small>Full original wording, natural repetition, images, and diagrams</small></span></span><span class="source-count"></span></summary><div class="evidence-body"><div class="evidence-intro"><h3>How to use this evidence</h3>The study brief above is a revision aid. Open any source page below to verify the complete wording and view the original slide in its exact visual layout.</div><div class="evidence-tools"><button data-open-all>Open all pages</button><button data-close-all>Close all pages</button><button data-print-source>Print evidence</button></div><div class="source-pages"></div></div></details>`;
 hero.insertAdjacentElement("afterend",hub);
 const pages=$(".source-pages",hub);let current=null,count=0;
 [...original.children].forEach(node=>{
   if(node.matches(".page-marker")){
     count++;current=document.createElement("details");current.className="source-page";
     current.innerHTML=`<summary><span>${esc(clean(node.textContent))}</span></summary><div class="source-page__body"></div>`;pages.appendChild(current);
   }else if(current){$(".source-page__body",current).appendChild(node)}
 });
 $(".source-count",hub).textContent=`${count} source page${count===1?"":"s"}`;
 original.remove();
 $("[data-open-all]",hub).onclick=()=>$$(".source-page",hub).forEach(x=>x.open=true);
 $("[data-close-all]",hub).onclick=()=>$$(".source-page",hub).forEach(x=>x.open=false);
 $("[data-print-source]",hub).onclick=()=>window.print();
 $$(".keyword",hub).forEach(b=>b.onclick=()=>{
   const active=b.classList.toggle("active"),key=b.dataset.key;
   $$(".study-highlight",hub).forEach(x=>x.replaceWith(document.createTextNode(x.textContent)));
   if(!active)return;
   $$(".source-page__body p,.source-page__body li",hub).forEach(el=>{el.innerHTML=el.textContent.replace(new RegExp(`(${key.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")})`,"ig"),'<mark class="study-highlight">$1</mark>')});
   $(".source-evidence",hub).open=true;
 });
}
setTimeout(init,0);
})();
