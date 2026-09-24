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

  function createOrientationGate() {
    if (document.getElementById('orientationGate')) return;
    const gate = document.createElement('div');
    gate.id = 'orientationGate';
    gate.className = 'orientation-gate';
    gate.setAttribute('role', 'status');
    gate.innerHTML = '<div><span class="rotate-icon">↻</span><strong>가로 화면 전용 게임입니다</strong><p>휴대폰을 가로로 돌려주세요.<br>세로 화면에서는 게임을 플레이할 수 없습니다.</p></div>';
    document.body.appendChild(gate);
  }

  function createFullscreenGate() {
    if (document.getElementById('fullscreenGate')) return;
    const gate = document.createElement('div');
    gate.id = 'fullscreenGate';
    gate.className = 'fullscreen-gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.innerHTML = '<div class="fullscreen-card"><span class="fullscreen-mark">✦</span><strong>SUNSET GUARD</strong><p>주소창 없이 게임 전체 화면을 사용합니다.<br>가로 화면으로 고정한 뒤 시작합니다.</p><button id="enterGameFullscreen" type="button">전체화면으로 게임 시작</button><small>전체화면을 종료하면 다시 시작 화면으로 돌아옵니다.</small></div>';
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
    const width = Math.floor(smallestPositive([
      viewport?.width,
      window.innerWidth,
      doc.clientWidth
    ], window.innerWidth));
    const height = Math.floor(smallestPositive([
      viewport?.height,
      window.innerHeight,
      doc.clientHeight
    ], window.innerHeight));

    root.style.setProperty('--mobile-vvw', `${width}px`);
    root.style.setProperty('--mobile-vvh', `${height}px`);
    root.classList.toggle('touch-device', coarse.matches);
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
    const orientationGate = document.getElementById('orientationGate');
    const fullscreenGate = document.getElementById('fullscreenGate');
    const isPortrait = coarse.matches && portrait.matches;
    const needsFullscreen = coarse.matches && !isPortrait && !isFullscreen() && !isStandaloneApp();

    if (orientationGate) orientationGate.hidden = !isPortrait;
    if (fullscreenGate) fullscreenGate.hidden = !needsFullscreen;
    root.classList.toggle('game-blocked', isPortrait || needsFullscreen);
    root.classList.toggle('game-fullscreen', isFullscreen() || isStandaloneApp());
  }

  function syncAll() {
    setViewportMetrics();
    syncGates();
    keepLandscapeLocked();
  }

  function settleViewport() {
    syncAll();
    requestAnimationFrame(setViewportMetrics);
    setTimeout(setViewportMetrics, 80);
    setTimeout(setViewportMetrics, 300);
  }

  createOrientationGate();
  createFullscreenGate();
  settleViewport();
  keepLandscapeLocked();

  window.addEventListener('pageshow', settleViewport, { passive: true });
  window.addEventListener('orientationchange', settleViewport, { passive: true });
  window.addEventListener('resize', setViewportMetrics, { passive: true });
  window.addEventListener('focus', settleViewport, { passive: true });
  document.addEventListener('fullscreenchange', settleViewport);
  document.addEventListener('webkitfullscreenchange', settleViewport);
  window.visualViewport?.addEventListener('resize', setViewportMetrics, { passive: true });
  window.visualViewport?.addEventListener('scroll', setViewportMetrics, { passive: true });
  coarse.addEventListener?.('change', syncAll);
  portrait.addEventListener?.('change', settleViewport);
  standaloneQuery.addEventListener?.('change', settleViewport);
  fullscreenQuery.addEventListener?.('change', settleViewport);
})();
