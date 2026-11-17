/* Skilltech Drawer — CC BY-SA 4.0. Native eXe links and activity runtime preserved. */
(() => {
  'use strict';
  function init() {
    const nav = document.getElementById('siteNav');
    if (!nav || document.getElementById('st-toolbar')) return;
    const fr = document.documentElement.lang.startsWith('fr');
    const t = fr ? {menu:'Chapitres',close:'Fermer',search:'Rechercher un chapitre',empty:'Aucun chapitre trouvé',outline:'Plan du cours',sections:'Sous-chapitres'} : {menu:'Chapters',close:'Close',search:'Find a chapter',empty:'No chapters found',outline:'Course outline',sections:'Subchapters'};
    document.body.classList.add('st-ready');
    const toolbar = document.createElement('header'); toolbar.id='st-toolbar';
    const toggle=document.createElement('button'); toggle.id='st-menu-toggle'; toggle.type='button';
    toggle.setAttribute('aria-controls','st-drawer'); toggle.setAttribute('aria-expanded','false');
    toggle.innerHTML='<span class="st-burger" aria-hidden="true">☰</span><span></span>'; toggle.lastChild.textContent=t.menu;
    const brand=document.createElement('span');brand.className='st-brand';brand.textContent='Skilltech.tools';
    const counter=document.querySelector('.page-counter');
    const position=document.createElement('span');position.className='st-position';position.textContent=counter?.textContent.trim()||'';
    toolbar.append(toggle,brand,position);document.body.prepend(toolbar);
    const dialog=document.createElement('dialog');dialog.id='st-drawer';dialog.setAttribute('aria-label',t.outline);
    const head=document.createElement('div');head.className='st-drawer-head';
    const title=document.createElement('h2');title.textContent=t.outline;
    const close=document.createElement('button');close.type='button';close.className='st-close';close.textContent='×';close.setAttribute('aria-label',t.close);head.append(title,close);
    const course=document.createElement('p');course.className='st-course-name';course.textContent=document.querySelector('.package-title')?.textContent||document.title;
    const search=document.createElement('input');search.type='search';search.className='st-search';search.placeholder=t.search;search.setAttribute('aria-label',t.search);
    const empty=document.createElement('p');empty.textContent=t.empty;empty.hidden=true;
    dialog.append(head,course,search,nav,empty);document.body.append(dialog);
    nav.removeAttribute('inert');nav.setAttribute('aria-label',t.outline);
    const groups=[];
    nav.querySelectorAll('li').forEach(li=>{
      const a=li.querySelector(':scope > a');const list=li.querySelector(':scope > ul');
      if(a?.classList.contains('active'))a.setAttribute('aria-current','page');
      if(!a||!list)return;
      const b=document.createElement('button');b.type='button';b.className='st-section-toggle';b.textContent='⌄';
      list.id='st-section-'+groups.length;b.setAttribute('aria-controls',list.id);b.setAttribute('aria-label',t.sections+': '+a.textContent);
      const expanded=!!li.querySelector('a.active');list.hidden=!expanded;b.setAttribute('aria-expanded',String(expanded));
      b.addEventListener('click',()=>{list.hidden=!list.hidden;b.setAttribute('aria-expanded',String(!list.hidden));});
      a.after(b);groups.push({list,b,expanded});
    });
    const items=[...nav.querySelectorAll('li')];
    search.addEventListener('input',()=>{
      const q=search.value.trim().toLocaleLowerCase();
      items.forEach(li=>{li.hidden=!!q&&!li.textContent.toLocaleLowerCase().includes(q);});
      groups.forEach(({list,b,expanded})=>{list.hidden=q?false:!expanded;b.setAttribute('aria-expanded',String(!list.hidden));});
      empty.hidden=items.some(li=>!li.hidden);
    });
    function shut(){dialog.close();}
    toggle.addEventListener('click',()=>{dialog.showModal();toggle.setAttribute('aria-expanded','true');document.body.classList.add('st-menu-open');close.focus();});
    close.addEventListener('click',shut);
    dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.clientX>r.right||e.clientX<r.left||e.clientY<r.top||e.clientY>r.bottom)shut();});
    dialog.addEventListener('close',()=>{toggle.setAttribute('aria-expanded','false');document.body.classList.remove('st-menu-open');toggle.focus();});
    nav.addEventListener('click',e=>{if(e.target.closest('a'))shut();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
