
(function(){
 const body=document.body;
 const lang=localStorage.getItem('msfLang')||'en'; body.classList.add('lang-'+lang); document.documentElement.lang=lang; document.documentElement.dir=lang==='ar'?'rtl':'ltr';
 const theme=localStorage.getItem('msfTheme')||'light'; document.documentElement.dataset.theme=theme;
 window.setLang=function(l){body.classList.remove('lang-en','lang-ar');body.classList.add('lang-'+l);document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';localStorage.setItem('msfLang',l)};
 window.toggleTheme=function(){const n=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=n;localStorage.setItem('msfTheme',n)};
 window.toggleMenu=function(){document.querySelector('.sidebar')?.classList.toggle('open')};
 document.addEventListener('click',e=>{const a=e.target.closest('.nav a');if(a&&innerWidth<1000)document.querySelector('.sidebar')?.classList.remove('open')});
})();
