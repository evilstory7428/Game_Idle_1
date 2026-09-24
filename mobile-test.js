(() => {
  const root = document.documentElement;
  const coarse = window.matchMedia('(pointer: coarse)');
  const portrait = window.matchMedia('(orientation: portrait)');
  const standaloneQuery = window.matchMedia('(display-mode: standalone)');
  const fullscreenQuery = window.matchMedia('(display-mode: fullscreen)');

  function isStandaloneApp() {
    return standaloneQuery.matches || fullscreenQuery.matches || window.navigator.standalone === true;
  }

  function isFullscreen() {
    return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
  }

  function createFullscreenGate() {
    if (document.getElementById('fullscreenGate')) return;
    const gate = document.createElement('div');
    gate.id = 'fullscreenGate';
    gate.className = 'fullscreen-gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.innerHTML = '<div class="fullscreen-card"><span class="fullscreen-mark">✦</span><strong>SUNSET GUARD</strong><p>주소창 없이 전체 화면으로 게임을 시작합니다.<br>게임 화면은 기기 방향과 관계없이 항상 가로 레이아웃을 유지합니다.</p><button id="enterGameFullscreen" type="button">전체화면으로 게임 시작</button><small>전체화면을 종료하면 다시 시작 화면이 표시됩니다.</small></div>';
    document.body.appendChild(gate);
    gate.querySelector('#enterGameFullscreen')?.addEventListener('click', enterGameMode);
  }

  function smallestPositive(values, fallback) {
    const valid = values.filter(v => Number.isFinite(v) && v > 0);
    return valid.length ? Math.min(...valid) : fallback;
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

    // The game always uses landscape logical coordinates. If the device is held
    // vertically, CSS rotates this logical landscape surface 90 degrees.
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

  async function enterGameMode() {
    const button = document.getElementById('enterGameFullscreen');
    if (button) {
      button.disabled = true;
      button.textContent = '전체화면 전환 중…';
    }

    await requestFullscreen();
    await lockLandscape();
    settleViewport();
    syncGates();

    if (button) {
      button.disabled = false;
      button.textContent = '전체화면으로 게임 시작';
    }
  }

  async function keepLandscapeLocked() {
    if (!coarse.matches) return;
    if (isFullscreen() || isStandaloneApp()) await lockLandscape();
  }

  function syncGates() {
    const fullscreenGate = document.getElementById('fullscreenGate');
    const needsFullscreen = coarse.matches && !isFullscreen() && !isStandaloneApp();
    if (fullscreenGate) fullscreenGate.hidden = !needsFullscreen;
    root.classList.toggle('game-blocked', needsFullscreen);
    root.classList.toggle('game-fullscreen', isFullscreen() || isStandaloneApp());
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
    setViewportMetrics();
    syncGates();
    syncWaveState();
    keepLandscapeLocked();
  }

  function settleViewport() {
    syncAll();
    requestAnimationFrame(setViewportMetrics);
    setTimeout(setViewportMetrics, 80);
    setTimeout(setViewportMetrics, 300);
  }

  // Old portrait warning is intentionally removed. Landscape is now persistent:
  // native/app environments lock orientation, browser fallback rotates the game.
  document.getElementById('orientationGate')?.remove();
  createFullscreenGate();
  settleViewport();
  keepLandscapeLocked();
  watchWaveState();

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
