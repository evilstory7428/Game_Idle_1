# Sunset Guard validation status — Phase 1–5 branch

## 기준

작업 브랜치: `gpt/game-overhaul-phase1`

기준 `main`: `def85bb1df638072e7f5dc0ed2069f058070d69d`

현재 작업은 2026-09-24에 검증됐던 기존 픽셀 프로토타입 위에 5,000웨이브 캠페인, 7인 영웅/v3 저장, 8부위 장비, 장기 경제, 모바일/PWA, 전투 연출을 단계적으로 추가한 것입니다.

## 기존 기준선에서 실제 검증됐던 내용

`main` 계열 기존 프로토타입에서는 다음 결과가 기록되어 있었습니다.

- Core tests 24개 통과
- Chromium integration 31개 통과, page error 0
- 탱커 기본 공격 100% / 범위 내 나머지 20%
- 탱커 총알/장전 미사용
- 미보유 영웅 잠금
- 강화 / 장비 / 상점 / 보스 / 재도전
- 저장 / 사운드 / 로그아웃 / 반응형 팝업
- 외부 이미지 요청 없는 단일 HTML

위 결과는 **현재 Phase 1–5 브랜치 전체가 통과했다는 의미가 아닙니다.** 이후 추가된 시스템은 아래 새 회귀 테스트로 다시 검증해야 합니다.

## 현재 추가된 검증 도구

### 1. `test-syntax.cjs`

외부 패키지 없이 전체 런타임 JavaScript를 `vm.Script`로 파싱합니다.

검사 대상에는 다음이 포함됩니다.

- 5,000웨이브 캠페인
- Phase 2 전투
- v3 / 8부위 장비
- Phase 3B 경제
- Phase 5 전투 연출
- 모바일 런타임
- Service Worker

### 2. `test.cjs`

기존 핵심 전투와 5,000웨이브 캠페인 회귀 테스트입니다.

- 탱커 피해/사거리/장전
- 영웅 정렬 및 잠금
- 마을 강화
- 모집 천장
- Act 적 라우팅
- Region / Act boss
- 저장 이전
- 최종 WAVE 5,000 메타데이터
- 반응형 팝업

### 3. `test-phase3.cjs`

첨부 기준 7인/v3 구조 집중 검증입니다.

- 낸시 / 루나 / 엘로나 / 제시 / 줄리 / 첼리 / 티나
- 8부위 장비 페이퍼돌
- v3 + v2 호환 이중 저장
- `armor/charm` → 신규 슬롯 이전
- 추천 배치
- 10회 묶음 강화

### 4. `test-phase3b.cjs`

장기 성장/경제 집중 검증입니다.

- WAVE 1 → 500 → 5,000 성장곡선 증가
- 장비 등급 메타데이터
- 장비 강화 + 부품 소비
- 일일 목표 보상
- 체크포인트 반복 파밍
- 파밍 중 v3 저장이 실제 본 진행 웨이브를 보존하는지 확인
- 경제 데이터 재저장

### 5. `test-mobile.cjs`

모바일/PWA 레이아웃 집중 검증입니다.

- 물리 세로 화면에서 논리 가로 좌표 유지
- 게임 전체 90° 회전 방식
- 전투 중 상단 헤더 제거
- 5인 수비대 한 줄 유지
- Phase 3B / Phase 5 설정 패널 모바일 표시
- 팝업 내부만 스크롤
- PWA manifest fullscreen / landscape
- Service Worker 최신 Phase 3B / Phase 5 파일 캐시

### 6. `test-phase5.cjs`

전투 연출/성능 집중 검증입니다.

- 화면 흔들림 기본 OFF
- 자동 / 높음 / 중간 / 낮음 품질
- 필살기 전투 FX
- 보스 등장 연출
- 품질 설정 v3 저장 유지

### 7. `test-release.cjs`

전체 릴리즈 검증 진입점입니다.

1. JavaScript 구문 검사
2. `build.py` 단일 HTML 생성
3. 외부 `<script src>` / stylesheet가 단일 HTML에 남지 않았는지 확인
4. Playwright가 설치되어 있으면 모든 브라우저 테스트 순차 실행
5. PWA / 경제 / 전투 연출 필수 파일 존재 확인

실행:

```bash
node test-release.cjs
```

Playwright 브라우저 검증까지 수행하려면:

```bash
npm install playwright
npx playwright install chromium
node test-release.cjs
```

## 아직 실제 실행 확인이 필요한 항목

현재 ChatGPT GitHub 연결 환경에는 브라우저 런타임이나 활성 GitHub Actions workflow가 제공되지 않아, 이번 Phase 1–5 변경 이후의 Playwright 결과를 실제 통과했다고 기록하지 않습니다.

병합 전에 다음을 실제 실행해야 합니다.

- `node test-release.cjs`
- 실제 Android 세로/가로 전환
- 실제 iPhone Safari 세로/가로 전환
- PWA 설치 후 fullscreen 실행
- 백그라운드 → 복귀
- WAVE 100 / 500 / 1,000 / 2,500 / 5,000 독립 전투
- v1 / v2 / v3 저장 이전 및 손상 복구
- 체크포인트 파밍 중 종료 → 재접속
- 일일/주간 날짜 경계 초기화
- 저사양 모바일에서 자동 품질 단계 전환

## 상용화 전에 별도 필요한 항목

현재 로컬 프로토타입 범위 밖이며 서버 설계가 필요합니다.

- 실제 계정 인증
- 클라우드 저장 / 충돌 해결
- 서버 권위 재화·모집·드랍 검증
- 결제 / 영수증 검증
- 계정 삭제 및 개인정보 처리
- 서버 기반 오프라인 보상

현재 PR은 위 신규 테스트를 실제 브라우저/기기에서 실행하기 전까지 Draft로 유지합니다.
