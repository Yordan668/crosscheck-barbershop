// ── CUSTOM CURSOR
const dot  = document.getElementById('curDot');
const ring = document.getElementById('curRing');
let mx=0,my=0,rx=0,ry=0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.left  = mx+'px';
  dot.style.top   = my+'px';
});
(function loop(){
  rx += (mx-rx)*.10; ry += (my-ry)*.10;
  ring.style.left = rx+'px'; ring.style.top = ry+'px';
  requestAnimationFrame(loop);
})();

// ── NAV SHADOW
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('shadow', scrollY > 40), {passive:true});

// ── CLIPPER SCROLL
const wrap   = document.getElementById('clipperWrap');
const banner = document.getElementById('clipperBanner');
let pos=-140, last=0;
window.addEventListener('scroll', () => {
  const r = banner.getBoundingClientRect();
  if(r.bottom>0 && r.top<window.innerHeight){
    const d = scrollY-last;
    pos += d*2.4;
    const w = banner.offsetWidth;
    if(pos>w+60) pos=-140;
    if(pos<-140) pos=w+60;
    wrap.style.left = pos+'px';
    wrap.style.transform = d<0 ? 'translateY(-50%) scaleX(-1)' : 'translateY(-50%) scaleX(1)';
  }
  last=scrollY;
},{passive:true});

// ── SCROLL REVEAL
const revEls = document.querySelectorAll('[data-r]');
const revObs = new IntersectionObserver(entries=>{
  entries.forEach((e,i)=>{
    if(e.isIntersecting){
      setTimeout(()=>e.target.classList.add('on'), i*90);
      revObs.unobserve(e.target);
    }
  });
},{threshold:.12});
revEls.forEach(el=>revObs.observe(el));

// ── MOBILE MENU
const burger = document.getElementById('burger');
const links  = document.getElementById('navLinks');
let open=false;
burger.addEventListener('click',()=>{
  open=!open;
  if(open){
    links.style.cssText=`display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2.5rem;position:fixed;inset:0;background:rgba(250,248,243,.98);z-index:300;`;
    links.querySelectorAll('a').forEach(a=>{
      a.style.fontSize='2rem'; a.style.fontFamily="'Playfair Display',serif"; a.style.color='#111110';
    });
  } else {
    links.removeAttribute('style');
    links.querySelectorAll('a').forEach(a=>a.removeAttribute('style'));
  }
  const sp=burger.querySelectorAll('span');
  sp[0].style.transform=open?'translateY(6.5px) rotate(45deg)':'';
  sp[1].style.opacity  =open?'0':'';
  sp[2].style.transform=open?'translateY(-6.5px) rotate(-45deg)':'';
});
links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{if(open)burger.click();}));

// ── ACTIVE NAV LINK
const sections=document.querySelectorAll('section[id]');
window.addEventListener('scroll',()=>{
  let cur='';
  sections.forEach(s=>{if(scrollY>=s.offsetTop-100)cur=s.id;});
  document.querySelectorAll('.nav__links a').forEach(a=>{
    a.style.color=a.getAttribute('href')==='#'+cur?'var(--dark)':'';
  });
},{passive:true});

// ── PARALLAX on hero image (subtle)
const heroImg = document.querySelector('.hero__right img');
if(heroImg){
  window.addEventListener('scroll',()=>{
    const p=Math.min(scrollY/window.innerHeight,1);
    heroImg.style.transform=`scale(1) translateY(${p*30}px)`;
  },{passive:true});
}
