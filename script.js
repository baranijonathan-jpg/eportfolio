/* Globals */
(() => {
  // Footer year
  document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Smooth scroll for nav and CTA
    document.querySelectorAll('a[href^="#"], button#ctaExplore').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        let targetId = el.getAttribute('href') || '#knowledge';
        if (el.id === 'ctaExplore') targetId = '#knowledge';
        const tgt = document.querySelector(targetId);
        if (tgt) tgt.scrollIntoView({behavior:'smooth',block:'start'});
      });
    });

    // Typing effect (respects reduced motion)
    const typedEl = document.getElementById('typed');
    const fullText = 'Bridging Business & Tech in the Decentralized Ecosystem.';
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typedEl) {
      if (prefersReduced) {
        typedEl.textContent = fullText;
      } else {
        let idx = 0;
        function type(){
          if(idx <= fullText.length){
            typedEl.textContent = fullText.slice(0,idx);
            idx++;
            setTimeout(type, 26 + (Math.random()*60));
          }
        }
        setTimeout(type,400);
        type();
      }
    }

    // Intersection Observer for reveal
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting) { e.target.classList.add('active'); obs.unobserve(e.target); }
      })
    },{threshold:0.12});
    document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

    // (intro video removed)

    // Custom cursor (hidden on touch or reduced-motion)
    const cursor = document.getElementById('cursor');
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (cursor && !isTouch && !prefersReduced) {
      let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
      document.addEventListener('mousemove', (e)=>{
        mouseX = e.clientX; mouseY = e.clientY;
        cursor.style.left = mouseX + 'px'; cursor.style.top = mouseY + 'px';
      });
      // enlarge on links
      document.querySelectorAll('a,button').forEach(a=>{
        a.addEventListener('mouseenter', ()=>{ cursor.style.width='36px'; cursor.style.height='36px'; cursor.style.background='rgba(179,107,255,0.06)'; });
        a.addEventListener('mouseleave', ()=>{ cursor.style.width='14px'; cursor.style.height='14px'; cursor.style.background='transparent'; });
      });
    } else if (cursor) {
      cursor.style.display = 'none';
      document.documentElement.classList.add('no-hover');
    }

    // Particle background: initialize if canvas exists and user hasn't requested reduced motion
    const canvas = document.getElementById('bgCanvas');
    if (canvas && !prefersReduced) {
      const ctx = canvas.getContext('2d');
      let DPR = Math.max(1, window.devicePixelRatio || 1);
      function _resizeCanvas(){
        // Reset transform to avoid accumulating scales on repeated resize
        DPR = Math.max(1, window.devicePixelRatio || 1);
        ctx.setTransform(1,0,0,1,0,0);
        canvas.width = Math.round(window.innerWidth * DPR);
        canvas.height = Math.round(window.innerHeight * DPR);
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        // Apply device pixel ratio scale so drawing uses logical coordinates
        ctx.setTransform(DPR,0,0,DPR,0,0);
        try{ console.info('canvas resize', { DPR, width: canvas.width, height: canvas.height, cssW: window.innerWidth, cssH: window.innerHeight }); }catch(e){}
      }
      window.addEventListener('resize', ()=>{ _resizeCanvas(); initParticles(); });

      // particles
      let particles = [];
      function rand(min,max){return Math.random()*(max-min)+min}
      function initParticles(){
        particles = [];
        // increase density for a more visible sky, but remain adaptive to screen area
        let count = Math.max(60, Math.floor((window.innerWidth*window.innerHeight)/50000));
        if (window.innerWidth < 720) count = Math.max(26, Math.floor((window.innerWidth*window.innerHeight)/85000));
        if (prefersReduced) count = 0;
        for(let i=0;i<count;i++){
          particles.push({
            x: rand(0,window.innerWidth),
            y: rand(0,window.innerHeight),
            vx: rand(-0.25,0.25),
            vy: rand(-0.15,0.15),
            // larger base radius for stronger glows
            r: rand(1.2,3.6),
            hue: rand(180,270),
            // phase for subtle twinkle animation
            phase: Math.random()*Math.PI*2
          });
        }
          try{ console.info('initParticles -> count', particles.length); }catch(e){}
          // expose for quick console debugging
          try{ window.__lastParticleCount = particles.length; }catch(e){}
      }
      let animId = null;
      let _debugFirstFrame = false;
      function step(){
        if (document.hidden) { animId = requestAnimationFrame(step); return; }
        ctx.clearRect(0,0,window.innerWidth,window.innerHeight);

        // one-time debug marker to confirm canvas is drawing
        if (!_debugFirstFrame) {
          try {
            console.info('bgCanvas: first frame draw, particle count=', particles.length);
            ctx.fillStyle = 'rgba(255,0,0,0.95)';
            ctx.fillRect(8,8,6,6);
          } catch(e) {}
          _debugFirstFrame = true;
        }

        // draw particles
        for(let p of particles){
          p.x += p.vx; p.y += p.vy; p.phase += 0.02;
          if(p.x < -30) p.x = window.innerWidth+30; if(p.x > window.innerWidth+30) p.x=-30;
          if(p.y < -30) p.y = window.innerHeight+30; if(p.y > window.innerHeight+30) p.y=-30;
          // glow (bigger, more opaque)
          ctx.beginPath();
          const glowRadius = Math.max(10, p.r * 10);
          const grad = ctx.createRadialGradient(p.x,p.y,p.r*0.3,p.x,p.y,glowRadius);
          grad.addColorStop(0, `rgba(0,240,255,${0.85})`);
          grad.addColorStop(0.5, `rgba(179,107,255,0.18)`);
          grad.addColorStop(1, `rgba(0,0,0,0)`);
          ctx.fillStyle = grad; ctx.arc(p.x,p.y,glowRadius,0,Math.PI*2); ctx.fill();
          // core with subtle twinkle
          const coreAlpha = 0.7 + Math.abs(Math.sin(p.phase)) * 0.35; // 0.7..1.05
          ctx.beginPath(); ctx.fillStyle = `rgba(255,255,255,${Math.min(coreAlpha,1)})`; ctx.arc(p.x,p.y,p.r*1.4,0,Math.PI*2); ctx.fill();
        }

        // connect lines when close
        for(let i=0;i<particles.length;i++){
          for(let j=i+1;j<particles.length;j++){
            const a = particles[i], b = particles[j];
            const dx = a.x-b.x, dy = a.y-b.y; const d = Math.sqrt(dx*dx+dy*dy);
            if(d < 160){
              ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
              const alpha = (1 - (d/160)) * 0.18; // stronger lines
              ctx.strokeStyle = `rgba(100,120,255,${alpha})`;
              ctx.lineWidth = 1.2; ctx.stroke();
            }
          }
        }

        animId = requestAnimationFrame(step);
      }

      // pause/resume on page visibility
      document.addEventListener('visibilitychange', ()=>{
        if(document.hidden){ if(animId) cancelAnimationFrame(animId); }
        else step();
      });

      // init
      // ensure canvas is visible for drawing
      canvas.style.display = canvas.style.display || 'block';
      _resizeCanvas(); initParticles(); step();
    }

    // keyboard detection to show focus styles only when navigating with keyboard
    function handleFirstTab(e){ if(e.key === 'Tab'){ document.documentElement.classList.add('using-keyboard'); window.removeEventListener('keydown', handleFirstTab); }}
    window.addEventListener('keydown', handleFirstTab);

    // debug helper removed

  });
})();
