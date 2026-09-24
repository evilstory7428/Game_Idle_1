(() => {
  const root = document.documentElement;
  const coarse = window.matchMedia('(pointer: coarse)');
  const portrait = window.matchMedia('(orientation: portrait)');

  function createOrientationGate() {
    if (document.getElementById('orientationGate')) return;
    const gate = document.createElement('div');
    gate.id = 'orientationGate';
    gate.className = 'orientation-gate';
    gate.setAttribute('role', 'status');
    gate.innerHTML = '<div><span class="rotate-icon">↻</span><strong>휴대폰을 가로로 돌려주세요</strong><p>서부마을 지키기는 가로 전용 모바일 게임입니다.<br>가로 화면에서 전체 전장과 조작 UI가 한 화면에 표시됩니다.</p></div>';
    document.body.appendChild(gate);
  }

  function setViewportMetrics() {
    const viewport = window.visualViewport;
    const width = viewport?.width || window.innerWidth;
    const height = viewport?.height || window.innerHeight;
    root.style.setProperty('--mobile-vvw', `${width}px`);
    root.style.setProperty('--mobile-vvh', `${height}px`);
    root.classList.toggle('touch-device', coarse.matches);
    root.classList.toggle('mobile-portrait', coarse.matches && portrait.matches);
    root.classList.toggle('mobile-landscape', coarse.matches && !portrait.matches);
  }

  async function lockLandscapeWhenPossible() {
    const standalone = window.matchMedia('(display-mode: fullscreen)').matches || window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (!standalone || !screen.orientation?.lock) return;
    try { await screen.orientation.lock('landscape'); } catch (_) {}
  }

  createOrientationGate();
  setViewportMetrics();
  lockLandscapeWhenPossible();

  const syncAll = () => {
    setViewportMetrics();
    lockLandscapeWhenPossible();
  };

  window.addEventListener('orientationchange', syncAll, { passive: true });
  window.addEventListener('resize', setViewportMetrics, { passive: true });
  window.visualViewport?.addEventListener('resize', setViewportMetrics, { passive: true });
  coarse.addEventListener?.('change', setViewportMetrics);
  portrait.addEventListener?.('change', syncAll);
})();
