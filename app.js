sudo tee /var/www/thinkers/app.js >/dev/null <<'JS'
// Mobile nav + dropdown
(function(){
  const ham = document.querySelector('.hamburger');
  const menu = document.getElementById('navMenu');
  ham && menu && ham.addEventListener('click', ()=>{
    const open = menu.style.display==='block';
    menu.style.display = open ? 'none' : 'block';
    ham.setAttribute('aria-expanded', String(!open));
  });
  const ddBtn = document.querySelector('.dd-btn');
  const dd = ddBtn ? ddBtn.nextElementSibling : null;
  ddBtn && dd && ddBtn.addEventListener('click', ()=>{
    const open = dd.style.display==='block';
    dd.style.display = open ? 'none' : 'block';
    ddBtn.setAttribute('aria-expanded', String(!open));
  });
})();

// Image fallback for any .media > img
(function(){
  const mediaImgs = document.querySelectorAll('.media > img');
  mediaImgs.forEach(img => {
    const wrap = img.parentElement;
    if(!wrap) return;
    wrap.classList.add('loading');
    function markEmpty(){
      wrap.classList.remove('loading');
      wrap.classList.add('is-empty');
      if (img && img.parentElement) img.parentElement.removeChild(img);
    }
    img.addEventListener('error', markEmpty);
    img.addEventListener('load', ()=>{
      wrap.classList.remove('loading');
      if(!(img.naturalWidth && img.naturalHeight)) markEmpty();
    });
    const src = img.getAttribute('src');
    if(!src){ markEmpty(); }
  });
})();

// Cinembox hero slider
(function(){
  const track = document.getElementById('cinemTrack');
  if(!track) return;
  const slides = Array.from(track.children);
  const dotsWrap = document.getElementById('cinemDots');
  const prev = document.querySelector('.cinem-prev');
  const next = document.querySelector('.cinem-next');
  let i = 0, timer;

  function renderDots(){
    dotsWrap.innerHTML = '';
    slides.forEach((_, idx)=>{
      const b = document.createElement('button');
      b.setAttribute('role','tab');
      b.setAttribute('aria-label', `Go to slide ${idx+1}`);
      if(idx===i) b.setAttribute('aria-selected','true');
      b.addEventListener('click',()=>go(idx));
      dotsWrap.appendChild(b);
    });
  }
  function go(n){
    i = (n + slides.length) % slides.length;
    track.style.transform = `translateX(${-100 * i}%)`;
    Array.from(dotsWrap.children).forEach((d, idx)=>{
      d.setAttribute('aria-selected', idx===i ? 'true' : 'false');
    });
  }
  function start(){ timer = setInterval(()=>go(i+1), 5000) }
  function stop(){ clearInterval(timer) }

  next && next.addEventListener('click', ()=>{ stop(); go(i+1); start(); });
  prev && prev.addEventListener('click', ()=>{ stop(); go(i-1); start(); });

  const root = track.closest('.cinem-slider');
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', start);

  // swipe
  let down=false, sx=0;
  root.addEventListener('pointerdown', (e)=>{ down=true; sx=e.clientX; root.setPointerCapture(e.pointerId); stop(); });
  root.addEventListener('pointerup', (e)=>{ if(!down) return; const dx=e.clientX-sx; down=false; if(Math.abs(dx)>40){ dx<0?go(i+1):go(i-1); } start(); });

  renderDots(); go(0); start();
})();

// Middle Double Slider (hero + thumbs)
(function initDoubleSlider(rootId){
  const root = document.getElementById(rootId);
  if(!root) return;
  const track = root.querySelector('.ds-track');
  const slides = Array.from(root.querySelectorAll('.ds-slide'));
  const prev = root.querySelector('.ds-prev');
  const next = root.querySelector('.ds-next');
  const thumbs = Array.from(root.querySelectorAll('.ds-thumb'));
  let i = 0, timer;

  function go(n){
    i = (n + slides.length) % slides.length;
    track.style.transform = `translateX(${-100*i}%)`;
    slides.forEach((s,idx)=>s.classList.toggle('is-active', idx===i));
    thumbs.forEach((t,idx)=>{
      t.classList.toggle('is-active', idx===i);
      t.setAttribute('aria-selected', idx===i ? 'true':'false');
    });
  }
  function start(){ timer = setInterval(()=>go(i+1), 6000); }
  function stop(){ clearInterval(timer); }

  prev && prev.addEventListener('click', ()=>{ stop(); go(i-1); start(); });
  next && next.addEventListener('click', ()=>{ stop(); go(i+1); start(); });
  thumbs.forEach((t,idx)=> t.addEventListener('click', ()=>{ stop(); go(idx); start(); }));

  // swipe
  const vp = root.querySelector('.ds-viewport');
  let down=false, sx=0;
  vp.addEventListener('pointerdown', (e)=>{ down=true; sx=e.clientX; vp.setPointerCapture(e.pointerId); stop(); });
  vp.addEventListener('pointerup', (e)=>{ if(!down) return; const dx=e.clientX-sx; down=false; if(Math.abs(dx)>40) go(i + (dx<0?1:-1)); start(); });

  // fallback if images fail
  slides.forEach(sl=>{
    const img = sl.querySelector('img');
    if(!img) return;
    img.addEventListener('error', ()=>{
      sl.style.background = '#2a2e36';
      img.remove();
    });
  });

  go(0); start();
})('ds1');

// NewsMag tabs filter
(function(){
  const tabs = document.querySelectorAll('.tm427-tabs .tab');
  if(!tabs.length) return;
  const lead = document.querySelector('.tm427-leadcard');
  const cards = document.querySelectorAll('.tm427-list .rowcard');

  function setActive(cat){
    tabs.forEach(t=>{
      const on = t.dataset.cat===cat || (cat==='all' && t.dataset.cat==='all');
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on? 'true':'false');
    });
  }
  function filter(cat){
    if(lead){
      const show = (cat==='all' || lead.dataset.cat===cat);
      lead.classList.toggle('is-hidden', !show);
    }
    cards.forEach(c=>{
      const show = (cat==='all' || c.dataset.cat===cat);
      c.classList.toggle('is-hidden', !show);
    });
  }
  tabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{ const cat = tab.dataset.cat; setActive(cat); filter(cat); });
    tab.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); tab.click(); } });
  });
  setActive('all'); filter('all');
})();
JS
