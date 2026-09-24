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

  function smallestPositive(values, fallback) {
    const valid = values.filter(v => Number.isFinite(v) && v > 0);
    return valid.length ? Math.min(...valid) : fallback;
  }

  function setViewportMetrics() {
    const viewport = window.visualViewport;
    const doc = document.documentElement;

    /*
      Android browsers can disagree about the usable viewport while the URL bar
      and system navigation are visible. Always use the smallest reported area
      so the bottom squad row can never be pushed under browser chrome.
    */
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
  }

  async function lockLandscapeWhenPossible() {
    const standalone = window.matchMedia('(display-mode: fullscreen)').matches || window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (!standalone || !screen.orientation?.lock) return;
    try { await screen.orientation.lock('landscape'); } catch (_) {}
  }

  function syncAll() {
    setViewportMetrics();
    lockLandscapeWhenPossible();
  }

  function settleViewport() {
    syncAll();
    requestAnimationFrame(setViewportMetrics);
    setTimeout(setViewportMetrics, 80);
    setTimeout(setViewportMetrics, 300);
  }

  createOrientationGate();
  settleViewport();

  window.addEventListener('pageshow', settleViewport, { passive: true });
  window.addEventListener('orientationchange', settleViewport, { passive: true });
  window.addEventListener('resize', setViewportMetrics, { passive: true });
  window.addEventListener('focus', setViewportMetrics, { passive: true });
  window.visualViewport?.addEventListener('resize', setViewportMetrics, { passive: true });
  window.visualViewport?.addEventListener('scroll', setViewportMetrics, { passive: true });
  coarse.addEventListener?.('change', setViewportMetrics);
  portrait.addEventListener?.('change', settleViewport);
})();
