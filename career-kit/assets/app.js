
const btn=document.querySelector('[data-theme]');
if(btn){btn.addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('ms-theme',document.body.classList.contains('dark')?'dark':'light')});}
if(localStorage.getItem('ms-theme')==='dark')document.body.classList.add('dark');
