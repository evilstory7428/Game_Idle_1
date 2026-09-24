(() => {
  const root = document.documentElement;
  const coarse = window.matchMedia('(pointer: coarse)');
  const portraitPhone = window.matchMedia('(max-width: 650px) and (orientation: portrait)');

  function syncClasses() {
    root.classList.toggle('touch-device', coarse.matches);
    root.classList.toggle('portrait-phone', portraitPhone.matches);
  }

  function createOrientationHint() {
    if (document.getElementById('mobileOrientationHint')) return;
    const hint = document.createElement('div');
    hint.id = 'mobileOrientationHint';
    hint.className = 'mobile-orientation-hint';
    hint.setAttribute('role', 'status');
    hint.innerHTML = '<span>📱 전장은 <b>가로 화면</b>에서 가장 크게 확인할 수 있습니다. 세로 화면에서도 메뉴와 영웅 관리는 테스트할 수 있어요.</span><button type="button" aria-label="안내 닫기">✕</button>';
    hint.querySelector('button').addEventListener('click', () => {
      hint.hidden = true;
      try { sessionStorage.setItem('sunsetGuardMobileHintDismissed', '1'); } catch (_) {}
    });
    const header = document.querySelector('header');
    header?.insertAdjacentElement('afterend', hint);
  }

  function syncHint() {
    createOrientationHint();
    const hint = document.getElementById('mobileOrientationHint');
    if (!hint) return;
    let dismissed = false;
    try { dismissed = sessionStorage.getItem('sunsetGuardMobileHintDismissed') === '1'; } catch (_) {}
    hint.hidden = dismissed || !portraitPhone.matches;
  }

  function setViewportHeight() {
    const height = window.visualViewport?.height || window.innerHeight;
    root.style.setProperty('--mobile-vvh', `${height}px`);
  }

  syncClasses();
  syncHint();
  setViewportHeight();

  const syncAll = () => { syncClasses(); syncHint(); setViewportHeight(); };
  window.addEventListener('orientationchange', syncAll, { passive: true });
  window.addEventListener('resize', syncAll, { passive: true });
  window.visualViewport?.addEventListener('resize', setViewportHeight, { passive: true });
  coarse.addEventListener?.('change', syncClasses);
  portraitPhone.addEventListener?.('change', syncHint);
})();
