---
name: waterloo-math-career-intelligence
description: >-
  캐나다 워털루 대학교(University of Waterloo) 수학과 1학년(1A/1B · 2026–2027) 재학생의
  2028년 첫 공식 코옵(Work Term 1) 및 북미 인턴십 취업을 지원하는 인텔리전스 대시보드·자동화 스킬입니다.
  실시간 공고 크롤링, KST 자동 D-Day 계산, 데스크톱/모바일/오프라인 통합 엔진, 텔레그램·카카오톡 공유를 제공합니다.
---

# Waterloo Math 2028 Career Intelligence Skill (v2.0)

이 스킬은 **캐나다 워털루 대학교 수학과(Faculty of Mathematics) 1학년(1A/1B) 재학생**이 **2028년 첫 공식 Co-op (Sequence 3 · Winter/Spring 2028 Work Term 1)** 및 2027 여름 대외 인턴십을 체계적으로 준비할 수 있도록 구축된 통합 커리어 인텔리전스 플랫폼입니다.

---

## 🎯 핵심 타깃 및 4대 진로 트랙

- **대상 프로필**: University of Waterloo · Honours Mathematics (Co-op) 1학년 (`2026–2027`) → **2028년 첫 공식 Co-op (`2028-01-10` WT1)** 타깃
- **4대 진로 트랙 (`career_tracks`)**:
  1. **퀀트 금융 · 트레이딩 (`quant`)**: Mathematical Finance, C&O, FARM, Statistics — Citadel, Jane Street, CPP Investments, BMO Capital Markets 등
  2. **데이터 사이언스 · AI (`data_ai`)**: Data Science, Statistics, Computational Math — Shopify, Qualcomm, RBC Borealis AI, Wealthsimple 등
  3. **소프트웨어 · 알고리즘 (`software`)**: CS / BMath CS, C&O, Applied Math — Google, NVIDIA, Bloomberg, Amazon 등
  4. **보험계리 · 리스크 (`actuary`)**: Actuarial Science, FARM — Manulife, Sun Life, Munich Re, AXA, State Farm 등

---

## 🏗️ 시스템 아키텍처 및 파일 구조

```text
19. North American university career information/
├── index.html                         # 🌐 루트 엔트리 (모바일 PWA 앱 + PC 와이드 자동 분기)
├── manifest.json                      # 📲 스마트폰 홈 화면 설치용 PWA Web App Manifest
├── 실행하기_대시보드.bat               # 🚀 원클릭 로컬 서버 + 실시간 데이터 열람 런처
├── .github/workflows/
│   └── telegram_alert.yml             # ☁️ 매일 09:00 KST 자동 크롤링 + 텔레그램 발송 + Pages 배포
├── .skill/waterloo_math_career/
│   └── SKILL.md                       # 본 스킬 명세서
├── 01. DB/
│   └── 북미 대학 취업 정보 사이트.docx # 4대 영역 북미 공식 취업 리소스 13선 원본
├── data/
│   ├── waterloo_math_profile.json     # 1학년→2028 코옵 4단계 로드맵, 15개 D-Day, 시급·분포 통계, 3단계 비자 전략
│   ├── internship_postings.json       # SimplifyJobs 실시간 북미 학부 인턴십 선별 공고 (CA/US)
│   └── career_resources.json          # 01. DB 기반 4개 카테고리 13개 공식 통계·채용·비자 플랫폼
├── config/
│   └── telegram_config.json           # 텔레그램 알림봇 및 카카오 SDK 설정 템플릿 (로컬 키는 .local.json 분리)
├── scripts/
│   ├── live_crawler.py                # SimplifyJobs 실시간 파싱 + 2026~2028 일정 검증 + 오프라인 스냅샷 자동 주입
│   ├── telegram_notifier.py           # 1학년 단기 일정 & 2028 코옵 마일스톤 2단 분리 텔레그램 발송기
│   └── run_server.py                  # REST API (/api/profile, /api/postings, /api/resources, /api/sync, /api/notify) 서버
└── web/
    ├── desktop_dashboard.html         # 💻 노트북/PC 와이드 커맨드센터 대시보드
    ├── mobile_dashboard.html          # 📱 스마트폰 PWA 및 데스크톱 시뮬레이터 전용 쉘
    └── assets/
        ├── icon.svg                   # UW Gold (#F5C518) + Math Pink Tie (#EC4899) 브랜드 아이콘
        ├── uw-theme.css               # Pretendard Variable + JetBrains Mono 디자인 토큰 시스템
        ├── uw-core.js                 # 공통 데이터 로더(API/JSON/file:// 오프라인 스냅샷), KST D-Day, 북마크·지원·체크리스트 상태 엔진
        └── uw-mobile-app.js           # 단일 소스 5탭 모바일 애플리케이션 컨트롤러
```

---

## 🚀 실행 및 운영 가이드

### 1. 로컬 서버 실행 (실시간 크롤링 & API 활성화)
```powershell
python scripts\run_server.py
```
- **💻 데스크톱**: `http://localhost:8080/web/desktop_dashboard.html`
- **📱 모바일 뷰**: `http://localhost:8080/index.html?view=mobile` 또는 `http://<로컬IP>:8080/web/mobile_dashboard.html`
- **오프라인 열람**: 서버 없이 탐색기에서 `index.html`, `web/desktop_dashboard.html`, `web/mobile_dashboard.html`을 더블클릭(`file://`)해도 `uw-core.js` 내장 최신 스냅샷으로 모든 차트·필터·체크리스트가 100% 동작합니다.

### 2. 실시간 북미 공고 크롤링 수동 실행
```powershell
python scripts\live_crawler.py
```
- `SimplifyJobs` 오픈 공고 풀을 파싱하여 캐나다(`CA`) 및 미국(`US`) 4대 트랙 학부 인턴십을 갱신하고, `data/*.json`과 `web/assets/uw-core.js` 오프라인 스냅샷을 동시에 동기화합니다.
- 웹 대시보드 상단의 **[실시간 동기화]** 버튼(`/api/sync`)으로도 즉시 실행할 수 있습니다.

### 3. 텔레그램 알림 발송 명령어
```powershell
python scripts\telegram_notifier.py --test   # 연동 테스트
python scripts\telegram_notifier.py --dday   # 1학년 학사·비자 + 2028 첫 코옵 마일스톤 발송
python scripts\telegram_notifier.py --jobs   # 실시간 북미 추천 인턴십 요약 발송
```

---

## 💻 데스크톱 vs 📱 모바일 v2.0 핵심 기능

### 💻 데스크톱 커맨드센터 (`web/desktop_dashboard.html`)
- **시퀀스 레일 & 동적 KPI**: `2028-01-10` 첫 코옵 출근 실시간 D-Day, 캐나다/미국 공고 비중, 내 관심/지원 현황 및 1학년 준비율 표시
- **좌측 실시간 인턴십 탐색기 (7 Cols)**: 키워드 즉시 검색, 정렬(`최신순/마감순/환율반영 시급순`), 국가/직무/관심(`⭐`)/지원완료(`✅`) 필터, `#태그` 원클릭 검색
- **우측 4대 인텔리전스 허브 (5 Cols)**:
  1. `📅 일정·할일`: 영구 저장 체크리스트(+개인 목표 추가), 2026~2028 전체 15개 D-Day, 4단계 코옵 로드맵
  2. `🧭 4대 트랙`: 워털루 세부전공(2A 선언), 1학년 핵심 선이수 과목, 기술 스택, 대표 채용사(클릭 시 공고 연동)
  3. `📊 통계·비자`: WT1~WT6 시급 상승 차트, 지역별/산업군별 비중 바, 유학생 비자 3단계 전략(CWP · J-1 · PGWP vs STEM OPT/H-1B)
  4. `🌐 공식DB(13)`: `01. DB` 수록 북미 공식 통계·채용·비자 검증 사이트 13선 전수 수록

### 📱 모바일 PWA 앱 (`index.html` & `web/mobile_dashboard.html`)
- **하단 5대 탭 네비게이션**: `🏠 홈` · `💼 공고` · `🧭 트랙·일정` · `📊 통계·DB` · `🔔 알림·공유`
- `localStorage` 실시간 동기화로 데스크톱과 모바일 시뮬레이터 간 관심 공고(`⭐`), 지원 완료(`✅`), 체크리스트 진행률이 즉시 연동됩니다.
