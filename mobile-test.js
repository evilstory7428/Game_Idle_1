(() => {
  const root = document.documentElement;
  const coarse = window.matchMedia('(pointer: coarse)');
  const portrait = window.matchMedia('(orientation: portrait)');
  const standaloneQuery = window.matchMedia('(display-mode: standalone)');
  const fullscreenQuery = window.matchMedia('(display-mode: fullscreen)');
  let immersiveAttempted = false;

  function isStandaloneApp() {
    return standaloneQuery.matches || fullscreenQuery.matches || window.navigator.standalone === true;
  }

  function isFullscreen() {
    return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
  }

  function smallestPositive(values, fallback) {
    const valid = values.filter(v => Number.isFinite(v) && v > 0);
    return valid.length ? Math.min(...valid) : fallback;
  }

  function removeLegacyGates() {
    document.getElementById('orientationGate')?.remove();
    document.getElementById('fullscreenGate')?.remove();
  }

  function setViewportMetrics() {
    const viewport = window.visualViewport;
    const doc = document.documentElement;
    const physicalWidth = Math.floor(smallestPositive([
      viewport?.width,
      window.innerWidth,
      doc.clientWidth
    ], window.innerWidth));
    const physicalHeight = Math.floor(smallestPositive([
      viewport?.height,
      window.innerHeight,
      doc.clientHeight
    ], window.innerHeight));

    // The UI always uses landscape logical coordinates. When the handset is
    // physically portrait, CSS rotates this logical surface 90 degrees.
    const logicalWidth = coarse.matches ? Math.max(physicalWidth, physicalHeight) : physicalWidth;
    const logicalHeight = coarse.matches ? Math.min(physicalWidth, physicalHeight) : physicalHeight;

    root.style.setProperty('--physical-vw', `${physicalWidth}px`);
    root.style.setProperty('--physical-vh', `${physicalHeight}px`);
    root.style.setProperty('--mobile-vvw', `${logicalWidth}px`);
    root.style.setProperty('--mobile-vvh', `${logicalHeight}px`);
    root.classList.toggle('touch-device', coarse.matches);
    root.classList.toggle('force-landscape', coarse.matches);
    root.classList.toggle('mobile-portrait', coarse.matches && portrait.matches);
    root.classList.toggle('mobile-landscape', coarse.matches && !portrait.matches);
    root.classList.toggle('game-fullscreen', isFullscreen() || isStandaloneApp());
    root.classList.remove('game-blocked');
  }

  async function requestFullscreen() {
    if (isFullscreen() || isStandaloneApp()) return true;
    const target = document.documentElement;
    const request = target.requestFullscreen || target.webkitRequestFullscreen;
    if (!request) return false;
    try {
      try {
        await request.call(target, { navigationUI: 'hide' });
      } catch (_) {
        await request.call(target);
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  async function lockLandscape() {
    if (!screen.orientation?.lock) return false;
    try {
      await screen.orientation.lock('landscape');
      return true;
    } catch (_) {
      try {
        await screen.orientation.lock('landscape-primary');
        return true;
      } catch (_) {
        return false;
      }
    }
  }

  // Browsers require a user gesture for fullscreen/orientation lock. The game is
  // already visibly landscape before this runs; the first normal game touch only
  // upgrades it to immersive fullscreen when the browser permits it.
  async function tryImmersiveOnFirstTouch() {
    if (immersiveAttempted || !coarse.matches) return;
    immersiveAttempted = true;
    await requestFullscreen();
    await lockLandscape();
    settleViewport();
  }

  async function keepLandscapeLocked() {
    if (!coarse.matches) return;
    if (isFullscreen() || isStandaloneApp()) await lockLandscape();
  }

  function syncWaveState() {
    const active = coarse.matches && window.Game?.phase === 'fight';
    root.classList.toggle('wave-active', Boolean(active));
  }

  function watchWaveState() {
    let previous = null;
    const tick = () => {
      const current = window.Game?.phase || '';
      if (current !== previous) {
        previous = current;
        syncWaveState();
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function syncAll() {
    removeLegacyGates();
    setViewportMetrics();
    syncWaveState();
    keepLandscapeLocked();
  }

  function settleViewport() {
    syncAll();
    requestAnimationFrame(setViewportMetrics);
    setTimeout(setViewportMetrics, 80);
    setTimeout(setViewportMetrics, 300);
  }

  removeLegacyGates();
  settleViewport();
  keepLandscapeLocked();
  watchWaveState();

  // Capture the first genuine touch/click without stopping the game action.
  document.addEventListener('pointerdown', tryImmersiveOnFirstTouch, { passive: true, once: true, capture: true });
  document.addEventListener('touchstart', tryImmersiveOnFirstTouch, { passive: true, once: true, capture: true });

  window.addEventListener('pageshow', settleViewport, { passive: true });
  window.addEventListener('orientationchange', settleViewport, { passive: true });
  window.addEventListener('resize', settleViewport, { passive: true });
  window.addEventListener('focus', settleViewport, { passive: true });
  document.addEventListener('fullscreenchange', settleViewport);
  document.addEventListener('webkitfullscreenchange', settleViewport);
  window.visualViewport?.addEventListener('resize', settleViewport, { passive: true });
  window.visualViewport?.addEventListener('scroll', setViewportMetrics, { passive: true });
  coarse.addEventListener?.('change', syncAll);
  portrait.addEventListener?.('change', settleViewport);
  standaloneQuery.addEventListener?.('change', settleViewport);
  fullscreenQuery.addEventListener?.('change', settleViewport);
})();
