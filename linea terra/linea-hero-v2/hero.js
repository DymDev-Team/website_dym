/**
 * Interactions indépendantes inspirées du composant <home-hero-wrap>.
 * Effets recréés : repère XY fluide, annotations synchronisées avec l'image,
 * loupe optionnelle, survol/clic, animation d'entrée CSS et contrôles.
 * Ce n'est pas le code JavaScript propriétaire/obfusqué de Linea Terra.
 */
(() => {
  'use strict';
  document.documentElement.classList.add('has-js');

  const initialize = () => {
    const stage = document.getElementById('hero-stage');
    const image = stage?.querySelector('.hero-architecture');
    if (!stage || !image) return;

    const xOutput = stage.querySelector('[data-control="x"]');
    const yOutput = stage.querySelector('[data-control="y"]');
    const magnifier = stage.querySelector('.magnifier');
    const hotspots = [...stage.querySelectorAll('.hotspot')];
    const btnGuides = document.querySelector('[data-toggle="guides"]');
    const btnZoom = document.querySelector('[data-toggle="zoom"]');
    const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const clamp = (x, min, max) => Math.min(max, Math.max(min, x));
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    let frame = 0, active = false, zoomEnabled = false, guidesEnabled = true;
    let imageGeometry = null;

    // Object-fit: cover — recalcule les positions sur la partie effectivement visible.
    function getImageGeometry() {
      const box = stage.getBoundingClientRect();
      const iw = image.naturalWidth || 1801;
      const ih = image.naturalHeight || 568;
      const scale = Math.max(box.width / iw, box.height / ih) * 1.012;
      const width = iw * scale, height = ih * scale;
      return {
        box, iw, ih, scale, width, height,
        left: (box.width - width) / 2,
        top: (box.height - height) / 2
      };
    }

    function syncHotspots() {
      imageGeometry = getImageGeometry();
      hotspots.forEach((hotspot) => {
        const x = Number(hotspot.dataset.assetX);
        const y = Number(hotspot.dataset.assetY);
        const pixelX = imageGeometry.left + x * imageGeometry.scale;
        const pixelY = imageGeometry.top + y * imageGeometry.scale;
        const inside = pixelX > 12 && pixelX < imageGeometry.box.width - 12 && pixelY > 12 && pixelY < imageGeometry.box.height - 12;
        hotspot.style.setProperty('--hot-x', `${pixelX}px`);
        hotspot.style.setProperty('--hot-y', `${pixelY}px`);
        hotspot.style.display = inside ? '' : 'none';
      });
    }

    function paint() {
      frame = 0;
      if (!active || !finePointer.matches) return;
      currentX += (targetX - currentX) * .23;
      currentY += (targetY - currentY) * .23;
      stage.style.setProperty('--pointer-x', `${currentX}px`);
      stage.style.setProperty('--pointer-y', `${currentY}px`);
      xOutput.textContent = String(Math.round(currentX)).padStart(4, '0');
      yOutput.textContent = String(Math.round(currentY)).padStart(4, '0');
      if (zoomEnabled && imageGeometry) {
        // La loupe montre exactement la zone de l'illustration sous le curseur.
        const zoom = 1.58;
        const diameter = magnifier.getBoundingClientRect().width || 158;
        const mid = diameter / 2;
        magnifier.style.backgroundSize = `${imageGeometry.width * zoom}px ${imageGeometry.height * zoom}px`;
        magnifier.style.backgroundPosition = `${mid - (currentX - imageGeometry.left) * zoom}px ${mid - (currentY - imageGeometry.top) * zoom}px`;
      }
      if (Math.abs(targetX - currentX) > .12 || Math.abs(targetY - currentY) > .12) {
        frame = requestAnimationFrame(paint);
      }
    }

    function pointerMove(e) {
      if (!finePointer.matches) return;
      const box = stage.getBoundingClientRect();
      targetX = clamp(e.clientX - box.left, 0, box.width);
      targetY = clamp(e.clientY - box.top, 0, box.height);
      if (!active) {
        currentX = targetX;
        currentY = targetY;
        active = true;
      }
      if (guidesEnabled) stage.classList.add('is-exploring');
      if (!frame) frame = requestAnimationFrame(paint);
    }
    function pointerLeave() {
      active = false;
      stage.classList.remove('is-exploring');
      cancelAnimationFrame(frame);
      frame = 0;
    }
    stage.addEventListener('pointermove', pointerMove, { passive: true });
    stage.addEventListener('pointerleave', pointerLeave);
    stage.addEventListener('pointercancel', pointerLeave);

    hotspots.forEach((hotspot) => {
      const marker = hotspot.querySelector('button');
      marker?.addEventListener('click', () => {
        const opened = hotspot.classList.contains('is-open');
        hotspots.forEach((item) => {
          item.classList.remove('is-open');
          item.querySelector('button')?.setAttribute('aria-expanded', 'false');
        });
        if (!opened) {
          hotspot.classList.add('is-open');
          marker.setAttribute('aria-expanded', 'true');
        }
      });
    });
    document.addEventListener('pointerdown', (e) => {
      if (!e.target.closest('.hotspot')) {
        hotspots.forEach((item) => {
          item.classList.remove('is-open');
          item.querySelector('button')?.setAttribute('aria-expanded', 'false');
        });
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hotspots.forEach((item) => {
          item.classList.remove('is-open');
          item.querySelector('button')?.setAttribute('aria-expanded', 'false');
        });
      }
    });

    btnGuides?.addEventListener('click', () => {
      guidesEnabled = !guidesEnabled;
      stage.classList.toggle('no-guides', !guidesEnabled);
      btnGuides.classList.toggle('is-selected', guidesEnabled);
      btnGuides.setAttribute('aria-pressed', String(guidesEnabled));
      btnGuides.querySelector('span').textContent = guidesEnabled ? 'ON' : 'OFF';
      if (!guidesEnabled) stage.classList.remove('is-exploring');
      else if (active) stage.classList.add('is-exploring');
    });
    btnZoom?.addEventListener('click', () => {
      zoomEnabled = !zoomEnabled;
      stage.classList.toggle('has-loupe', zoomEnabled);
      btnZoom.classList.toggle('is-selected', zoomEnabled);
      btnZoom.setAttribute('aria-pressed', String(zoomEnabled));
      btnZoom.querySelector('span').textContent = zoomEnabled ? 'ON' : 'OFF';
      if (active) { cancelAnimationFrame(frame); frame = requestAnimationFrame(paint); }
    });

    if (image.complete) syncHotspots();
    else image.addEventListener('load', syncHotspots, { once:true });
    window.addEventListener('resize', syncHotspots, { passive:true });
    if ('ResizeObserver' in window) new ResizeObserver(syncHotspots).observe(stage);
    if (finePointer.addEventListener) finePointer.addEventListener('change', pointerLeave);
    if (motionMedia.matches) document.documentElement.classList.add('reduced-motion');
    requestAnimationFrame(() => document.documentElement.classList.add('is-ready'));
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once:true });
  else initialize();
})();
