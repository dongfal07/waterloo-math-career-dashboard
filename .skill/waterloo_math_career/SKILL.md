---
name: waterloo-math-career-intelligence
description: >-
  캐나다 워털루 대학교(University of Waterloo) 수학과 1학년 학생을 위한 코옵 및 북미 인턴십 취업 정보 시스템.
  공식 통계 분석, 실시간 인턴십 공고 모니터링, 데스크톱 및 모바일 전용 독립 대시보드 구동, 텔레그램 알림 자동화 워크플로우를 제공합니다.
---

# Waterloo Math Career Intelligence Skill

이 스킬은 **캐나다 워털루 대학교 수학과(Faculty of Mathematics) 1학년 학생**의 관점에서, 향후 코옵(Co-op) 및 북미 인턴십 취업 준비를 효과적으로 진행할 수 있도록 구축된 전용 취업 정보 및 알림 자동화 시스템입니다.

---

## 🎯 주요 대상 및 진로 트랙

- **대상**: 워털루 대학교 Honours Mathematics 1학년 (1A / 1B Co-op 시퀀스 준비생)
- **주요 진로 분야**:
  1. **퀀트 / 금융공학**: Quantitative Trading & Research (Citadel, Jane Street, CPP Investments, Scotiabank 등)
  2. **데이터 사이언스 & 머신러닝**: Data Science, ML Modeling (Shopify, Wealthsimple, BMO AI Labs 등)
  3. **소프트웨어 개발**: SWE, Distributed Systems, High-Frequency Trading Systems (Google, Bloomberg 등)
  4. **보험계리학 & 리스크**: Actuarial Science (Manulife, Sun Life, Munich Re 등)

---

## 🏗️ 시스템 구성 및 파일 구조

```
19. North American university career information/
├── .skill/
│   └── waterloo_math_career/
│       └── SKILL.md                 # 본 스킬 정의 및 자동화 워크플로우 명세서
├── 01. DB/
│   └── 북미 대학 취업 정보 사이트.docx # 4대 영역 공식 사이트 분석 원본
├── data/
│   ├── waterloo_math_profile.json   # 1학년 로드맵, 공식 시급 통계, 비자 규정
│   ├── career_resources.json        # 4대 공식 데이터 출처 (Scorecard, StatCan 등)
│   └── internship_postings.json     # 1학년 타깃 퀀트/데이터/SW 인턴십 추천 공고
├── config/
│   └── telegram_config.json         # 텔레그램 봇 토큰 및 알림 임계값 설정
├── scripts/
│   ├── telegram_notifier.py         # 텔레그램 메시지 발송 및 Dry-run 모듈
│   └── run_server.py                # 로컬 REST API 및 대시보드 호스팅 서버
└── web/
    ├── desktop_dashboard.html       # 💻 노트북/PC 와이드 분석 그리드 대시보드
    └── mobile_dashboard.html        # 📱 스마트폰 네이티브 터치/PWA 모바일 웹앱
```

---

## 🚀 빠른 시작 가이드

### 1. 로컬 통합 서버 실행 (추천)
노트북 터미널에서 아래 명령을 실행합니다:
```powershell
python scripts\run_server.py
```
실행 시 자동으로 로컬 IP가 감지되며, 터미널에 아래와 같이 접속 URL이 출력됩니다:
- **💻 노트북/PC**: 브라우저에서 `http://localhost:8080/web/desktop_dashboard.html` 접속
- **📱 휴대폰(동일 Wi-Fi)**: 스마트폰 브라우저에서 `http://<로컬IP>:8080/web/mobile_dashboard.html` 접속

> **참고**: 별도의 서버 실행 없이도 탐색기에서 `desktop_dashboard.html`이나 `mobile_dashboard.html` 파일을 더블클릭하여 오프라인 모드로 즉시 열람하실 수 있습니다.

---

### 2. 텔레그램 모바일 알림 연동 및 실행

#### A. 텔레그램 봇 설정 (`config/telegram_config.json`)
1. 텔레그램 앱에서 `@BotFather`를 검색하고 `/newbot`을 입력하여 새 봇을 만듭니다.
2. 발급받은 `Bot Token`을 복사합니다.
3. 텔레그램 앱에서 `@userinfobot`과 대화하여 본인의 `Chat ID`를 확인합니다.
4. `config/telegram_config.json`을 열어 토큰과 챗 ID를 입력하고 `"enabled": true`로 저장합니다.

#### B. 알림 명령어 실행
```powershell
# 1. 텔레그램 연동 테스트 메시지 발송
python scripts\telegram_notifier.py --test

# 2. WaterlooWorks 및 주요 마감일 D-Day 알림 발송
python scripts\telegram_notifier.py --dday

# 3. 1학년 수학과 추천 인턴십 TOP 3 공고 요약 발송
python scripts\telegram_notifier.py --jobs
```
> **Dry-run 지원**: 토큰이 입력되지 않았거나 `enabled`가 `false`인 경우, 콘솔에 모의 발송 결과가 포맷팅되어 안전하게 출력됩니다.

---

## 💻 vs 📱 대시보드 기능 비교

### 💻 노트북/데스크톱 대시보드 (`web/desktop_dashboard.html`)
- **화면 구성**: 3단 와이드 레이아웃 (공고 테이블 50% + 로드맵 25% + 차트/통계 25%)
- **핵심 기능**:
  - 상세 검색 및 국가(🇨🇦/🇺🇸), 직무(Quant/Data/SWE/Actuary) 다중 필터
  - Chart.js 기반 워털루 수학과 학기별(Term 1~6) 평균 시급 상승 곡선
  - 1학년 코옵 준비 단계별 아코디언 로드맵
  - 원클릭 텔레그램 알림 발송 테스트

### 📱 스마트폰 모바일 대시보드 (`web/mobile_dashboard.html`)
- **화면 구성**: 세로 모드(390~430px) 최적화, 터치 전용 카드 뷰, 하단 고정 4대 탭 네비게이션
- **4대 탭 기능**:
  - 🏠 **홈**: D-Day 긴급 알림 배너, 1A 코옵 필수 투두리스트(인터랙티브 체크박스), 오늘의 추천 인턴십 TOP 2
  - 💼 **공고**: 한 손 조작 가로 스크롤 필터 칩, 카드형 공고, 1-Tap 공식 지원 링크
  - 📊 **통계·비자**: 모바일 최적화 미니 차트, 캐나다 Co-op Work Permit / 미국 J-1 비자 퀵 체크, 01.DB 공식 링크 칩
  - 🔔 **알림봇**: 모바일에서 원터치로 텔레그램 D-Day 및 인턴십 알림 수신 트리거

---

## 🔄 데이터 업데이트 및 유지보수

1. **신규 인턴십 공고 추가**:
   - `data/internship_postings.json`에 기업명, 직무, 시급, 비자 스폰서십, 링크를 JSON 형식으로 추가하면 데스크톱과 모바일 대시보드 및 텔레그램 알림에 즉시 반영됩니다.
2. **워털루 코옵 마감일 갱신**:
   - `data/waterloo_math_profile.json`의 `d_day_alerts` 항목에서 날짜와 D-Day 라벨을 수정합니다.
