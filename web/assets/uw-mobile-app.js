/**
 * Waterloo Faculty of Mathematics Career Intelligence — Unified Mobile App v2.0
 * Powers both root `index.html` and `web/mobile_dashboard.html` (including Desktop Simulator iframe).
 */
(function (window, document) {
  'use strict';

  const UWCore = window.UWCore;
  if (!UWCore) {
    console.error('[UWMobile] UWCore is required before uw-mobile-app.js');
    return;
  }

  const bodyDataset = document.body ? document.body.dataset : {};
  const DATA_PREFIX = bodyDataset.dataPrefix || '../data';
  const ASSET_PREFIX = bodyDataset.assetPrefix || 'assets';
  const DESKTOP_HREF = bodyDataset.desktopHref || 'desktop_dashboard.html';
  const IS_IFRAME = window.self !== window.top;

  const state = {
    data: {
      profile: UWCore.OFFLINE_SNAPSHOT.profile,
      postings: UWCore.OFFLINE_SNAPSHOT.postings,
      resources: UWCore.OFFLINE_SNAPSHOT.resources
    },
    activeTab: 'home', // home | jobs | tracks | stats | alerts
    tracksSubView: 'dday', // dday | roadmap | career
    statsSubView: 'metrics', // metrics | db
    scheduleFilter: 'ALL', // ALL | short_term | target_2028
    country: 'ALL',
    track: 'ALL',
    status: 'ALL', // ALL | BOOKMARKED | APPLIED
    query: '',
    sortBy: 'recent', // recent | deadline | pay
    kakaoType: 'dday',
    kakaoJobId: null,
    chartInstance: null
  };

  function mountShell() {
    const root = document.getElementById('uw-mobile-root');
    if (!root) return;

    root.innerHTML = `
      <!-- Top Brand Hairline (UW Gold + Math Pink Tie) -->
      <div class="uw-brand-ribbon w-full sticky top-0 z-50"></div>

      <!-- Sticky Mobile App Header -->
      <header class="sticky top-[3px] z-40 bg-[#0B101D]/95 backdrop-blur-md border-b border-slate-800/90 px-4 py-2.5 flex items-center justify-between gap-2 pt-safe">
        <div class="flex items-center space-x-2.5 min-w-0">
          <img src="${UWCore.escapeHtml(ASSET_PREFIX)}/icon.svg" alt="UW Math" class="w-8 h-8 rounded-xl border border-slate-700/80 shrink-0">
          <div class="min-w-0">
            <div class="flex items-center space-x-1.5">
              <h1 class="text-xs font-extrabold text-white tracking-tight truncate">Waterloo Math 2028</h1>
              <span class="px-1.5 py-0.2 text-[9.5px] font-extrabold bg-mathPink/20 text-pink-300 border border-mathPink/40 rounded-full shrink-0">1학년·WT1</span>
            </div>
            <p class="text-[10px] text-slate-400 truncate" id="m-header-sub">Honours Math · 2028 첫 Co-op 타깃</p>
          </div>
        </div>

        <div class="flex items-center space-x-1.5 shrink-0">
          <button onclick="UWMobile.handleLiveSync()" id="m-btn-sync-top"
            class="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-700/80 flex items-center justify-center text-xs active:scale-95 transition"
            title="실시간 데이터 동기화">
            <i id="m-sync-icon" class="fa-solid fa-arrows-rotate"></i>
          </button>

          <button onclick="UWMobile.triggerKakaoShare('dday')"
            class="px-2.5 h-8 rounded-xl bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] text-[11px] font-extrabold flex items-center space-x-1 shadow active:scale-95 transition">
            <i class="fa-solid fa-comment text-[10px]"></i>
            <span>카톡</span>
          </button>

          ${!IS_IFRAME ? `
            <a href="${UWCore.escapeHtml(DESKTOP_HREF)}"
              class="px-2 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-[10.5px] font-bold flex items-center justify-center"
              title="PC 와이드 대시보드로 전환">
              PC뷰
            </a>
          ` : ''}
        </div>
      </header>

      <!-- Main Tab Viewport -->
      <main class="max-w-md mx-auto px-3.5 pt-3.5 pb-24 space-y-3.5">

        <!-- =============================================================== -->
        <!-- TAB 1: HOME (2028 Sequence + Urgent D-Days + Persistent Todos)  -->
        <!-- =============================================================== -->
        <section id="m-pane-home" class="tab-pane active space-y-3.5">

          <!-- Hero 2028 First Co-op Card -->
          <div class="uw-panel rounded-2xl p-3.5 space-y-2.5 border-uwGold/30">
            <div class="flex items-center justify-between gap-2">
              <span class="px-2 py-0.5 rounded-md bg-uwGold/15 text-uwGold border border-uwGold/30 text-[10px] font-extrabold">
                Sequence 3 · 1A/1B 재학
              </span>
              <span class="font-quant text-[10.5px] font-extrabold px-2 py-0.5 rounded-lg bg-mathPink/20 text-pink-200 border border-mathPink/40">
                2028 첫 코옵 <span data-due-date="2028-01-10">D-?</span>
              </span>
            </div>

            <div>
              <h2 class="text-sm font-extrabold text-white leading-snug">
                2028년 첫 공식 Co-op (Work Term 1) 출격 로드맵
              </h2>
              <p class="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                1학년 학점·CWP 비자 확보 → <span class="text-emerald-300 font-semibold">2027 여름 스펙 골든타임</span> → 2027 가을 WaterlooWorks 본 매칭
              </p>
            </div>

            <!-- Compact 4-Step Rail -->
            <div class="grid grid-cols-4 gap-1 text-[9.5px] text-center pt-0.5">
              <div class="p-1.5 rounded-lg seq-step-active border">
                <div class="font-quant font-extrabold text-uwGold">1A/1B</div>
                <div class="text-white font-bold truncate">현재 학기</div>
              </div>
              <div class="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div class="font-quant font-bold text-emerald-400">27 여름</div>
                <div class="text-slate-300 truncate">스펙 브릿지</div>
              </div>
              <div class="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div class="font-quant font-bold text-sky-400">27 가을</div>
                <div class="text-slate-300 truncate">WW 본지원</div>
              </div>
              <div class="p-1.5 rounded-lg seq-step-target border">
                <div class="font-quant font-extrabold text-pink-300">28.01</div>
                <div class="text-white font-bold truncate">🎯 첫 코옵</div>
              </div>
            </div>

            <!-- Personal Tracker Quick Strip -->
            <div class="pt-2 border-t border-slate-800/90 flex items-center justify-between text-[11px]">
              <div class="flex items-center space-x-2.5">
                <button onclick="UWMobile.jumpToSavedJobs('BOOKMARKED')" class="text-slate-200 hover:text-uwGold font-semibold">
                  ⭐ 관심 <span id="m-home-bm" class="font-quant font-extrabold text-uwGold">0</span>
                </button>
                <span class="text-slate-700">|</span>
                <button onclick="UWMobile.jumpToSavedJobs('APPLIED')" class="text-slate-200 hover:text-emerald-300 font-semibold">
                  ✅ 지원 <span id="m-home-ap" class="font-quant font-extrabold text-emerald-400">0</span>
                </button>
              </div>
              <span id="m-home-sync-ts" class="font-quant text-[10px] text-slate-400">동기화 확인 중</span>
            </div>
          </div>

          <!-- Dynamic Top-3 Urgent D-Day Alerts -->
          <div class="uw-panel rounded-2xl p-3.5 space-y-2.5">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-extrabold text-white flex items-center">
                <i class="fa-regular fa-bell text-rose-400 mr-1.5"></i>임박 학사·비자 D-Day TOP 3
              </h3>
              <button onclick="UWMobile.openScheduleFull()" class="text-[11px] font-bold text-uwGold hover:underline">
                전체 일정 보기 →
              </button>
            </div>
            <div id="m-home-ddays" class="space-y-2"></div>
          </div>

          <!-- Interactive Persistent Checklist + Add Custom Todo -->
          <div class="uw-panel rounded-2xl p-3.5 space-y-2.5">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-extrabold text-white flex items-center">
                <i class="fa-solid fa-list-check text-emerald-400 mr-1.5"></i>1학년 코옵 준비 체크리스트
              </h3>
              <span id="m-chk-badge" class="font-quant text-[10.5px] font-extrabold px-2 py-0.5 rounded bg-uwGold/15 text-uwGold border border-uwGold/30">0/0</span>
            </div>

            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div id="m-chk-bar" class="h-full bg-gradient-to-r from-uwGold to-mathPink transition-all duration-300" style="width:0%"></div>
            </div>

            <div id="m-chk-list" class="space-y-1.5"></div>

            <form onsubmit="UWMobile.handleAddTodo(event)" class="flex gap-1.5 pt-1">
              <input id="m-todo-input" type="text" placeholder="내 목표 추가 (예: STAT 230 예습, Exam P)"
                class="flex-1 bg-slate-950 border border-slate-800 focus:border-uwGold rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none">
              <button type="submit" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-uwGold text-xs font-extrabold rounded-xl border border-slate-700 shrink-0">
                + 추가
              </button>
            </form>
          </div>

          <!-- Featured Top-3 Live Internships -->
          <div class="uw-panel rounded-2xl p-3.5 space-y-2.5">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xs font-extrabold text-white">🔥 실시간 북미 추천 인턴십 TOP 3</h3>
                <p class="text-[10.5px] text-slate-400">2027 대외 인턴 도전 & 2028 첫 코옵 벤치마크</p>
              </div>
              <button onclick="UWMobile.switchTab('jobs')" class="px-2.5 py-1 rounded-lg bg-uwGold text-slate-950 text-[11px] font-extrabold shrink-0">
                전체 공고 →
              </button>
            </div>
            <div id="m-home-top-jobs" class="space-y-2"></div>
          </div>

        </section>

        <!-- =============================================================== -->
        <!-- TAB 2: JOBS (Search, Sort, Bookmarks, Applied, 29 Live Roles)   -->
        <!-- =============================================================== -->
        <section id="m-pane-jobs" class="tab-pane space-y-3">

          <!-- Search + Sort -->
          <div class="uw-panel rounded-2xl p-3 space-y-2.5">
            <div class="flex gap-2">
              <div class="relative flex-1">
                <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                <input id="m-job-search" type="text" oninput="UWMobile.handleSearch(this.value)"
                  placeholder="기업, 직무, 도시, 기술(Python, C++)..."
                  class="w-full bg-slate-950 border border-slate-800 focus:border-uwGold rounded-xl pl-8 pr-7 py-2 text-xs text-white placeholder-slate-500 focus:outline-none">
                <button id="m-clear-search" onclick="UWMobile.clearSearch()" class="hidden absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">✕</button>
              </div>

              <select id="m-job-sort" onchange="UWMobile.handleSort(this.value)"
                class="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-[11px] font-bold text-slate-200 focus:outline-none focus:border-uwGold shrink-0">
                <option value="recent">최신순</option>
                <option value="deadline">마감순</option>
                <option value="pay">시급순</option>
              </select>
            </div>

            <!-- Horizontal Country & Status Filter Chips -->
            <div class="flex space-x-1.5 overflow-x-auto no-scrollbar pb-0.5 text-[11px]" id="m-status-country-chips"></div>

            <!-- Horizontal Track Filter Chips -->
            <div class="flex space-x-1.5 overflow-x-auto no-scrollbar text-[11px]" id="m-track-chips"></div>

            <!-- Summary + Kakao Share Strip -->
            <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span id="m-jobs-count-label" class="font-quant text-slate-300 font-semibold">0건 표시</span>
              <button onclick="UWMobile.triggerKakaoShare('jobs')"
                class="px-2.5 py-1 rounded-lg bg-[#FEE500] text-[#191919] font-extrabold text-[10.5px] flex items-center space-x-1">
                <i class="fa-solid fa-comment text-[9.5px]"></i>
                <span>추천공고 카톡 공유</span>
              </button>
            </div>
          </div>

          <!-- Job Cards Container -->
          <div id="m-jobs-list" class="space-y-2.5"></div>

        </section>

        <!-- =============================================================== -->
        <!-- TAB 3: TRACKS & FULL 2028 SCHEDULE                              -->
        <!-- =============================================================== -->
        <section id="m-pane-tracks" class="tab-pane space-y-3">

          <!-- Segmented Sub-Nav -->
          <div class="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
            <button onclick="UWMobile.setTracksSubView('dday')" id="m-tsub-dday" class="py-2 rounded-lg font-extrabold bg-uwGold text-slate-950">📅 전체 일정</button>
            <button onclick="UWMobile.setTracksSubView('roadmap')" id="m-tsub-roadmap" class="py-2 rounded-lg font-semibold text-slate-400">🗺️ 4단계 로드맵</button>
            <button onclick="UWMobile.setTracksSubView('career')" id="m-tsub-career" class="py-2 rounded-lg font-semibold text-slate-400">🧭 4대 트랙</button>
          </div>

          <!-- Sub-View 1: Full 2026-2028 D-Day Schedule -->
          <div id="m-tracks-dday-box" class="uw-panel rounded-2xl p-3.5 space-y-2.5">
            <div class="flex items-center justify-between gap-2">
              <h3 class="text-xs font-extrabold text-white">워털루 학사 & 2028 Co-op 일정</h3>
              <div class="flex space-x-1 text-[10px]">
                <button onclick="UWMobile.setScheduleFilter('ALL')" id="m-sf-ALL" class="px-2 py-0.5 rounded bg-uwGold text-slate-950 font-extrabold">전체</button>
                <button onclick="UWMobile.setScheduleFilter('short_term')" id="m-sf-short_term" class="px-2 py-0.5 rounded text-slate-400">1학년</button>
                <button onclick="UWMobile.setScheduleFilter('target_2028')" id="m-sf-target_2028" class="px-2 py-0.5 rounded text-pink-300">🎯2028</button>
              </div>
            </div>
            <div id="m-full-dday-list" class="space-y-2"></div>
          </div>

          <!-- Sub-View 2: 4-Phase Master Roadmap -->
          <div id="m-tracks-roadmap-box" class="hidden space-y-2.5"></div>

          <!-- Sub-View 3: 4 Career Tracks Matrix -->
          <div id="m-tracks-career-box" class="hidden space-y-2.5"></div>

        </section>

        <!-- =============================================================== -->
        <!-- TAB 4: STATS, 3-STAGE VISA & ALL 13 OFFICIAL DB RESOURCES       -->
        <!-- =============================================================== -->
        <section id="m-pane-stats" class="tab-pane space-y-3">

          <!-- Segmented Sub-Nav -->
          <div class="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
            <button onclick="UWMobile.setStatsSubView('metrics')" id="m-ssub-metrics" class="py-2 rounded-lg font-extrabold bg-uwGold text-slate-950">📈 시급·분포·비자</button>
            <button onclick="UWMobile.setStatsSubView('db')" id="m-ssub-db" class="py-2 rounded-lg font-semibold text-slate-400">🌐 공식 DB 13선</button>
          </div>

          <!-- Metrics + Visa Box -->
          <div id="m-stats-metrics-box" class="space-y-3">
            <div class="uw-panel rounded-2xl p-3.5 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-extrabold text-white">수학과 코옵 학기별 평균 시급</span>
                <span id="m-emp-rate-badge" class="font-quant text-[10.5px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">취업률 96.4%</span>
              </div>
              <div class="h-40 w-full">
                <canvas id="mEarningsChart"></canvas>
              </div>
            </div>

            <div class="uw-panel rounded-2xl p-3.5 space-y-2.5">
              <h4 class="text-xs font-extrabold text-white">취업 지역 분포 & 진출 산업군 비중</h4>
              <div id="m-regional-bars" class="space-y-2"></div>
              <div class="border-t border-slate-800 my-2"></div>
              <div id="m-sector-bars" class="space-y-2"></div>
            </div>

            <div class="uw-panel rounded-2xl p-3.5 space-y-2.5">
              <h4 class="text-xs font-extrabold text-white flex items-center">
                <i class="fa-solid fa-passport text-uwGold mr-1.5"></i>유학생 비자 3단계 완전 전략
              </h4>
              <div id="m-visa-cards" class="space-y-2"></div>
            </div>
          </div>

          <!-- Official 13 Resources Box -->
          <div id="m-stats-db-box" class="hidden space-y-3"></div>

        </section>

        <!-- =============================================================== -->
        <!-- TAB 5: ALERTS, LIVE SYNC, KAKAO & TELEGRAM HUB                  -->
        <!-- =============================================================== -->
        <section id="m-pane-alerts" class="tab-pane space-y-3">

          <!-- Live Sync Center -->
          <div class="uw-panel rounded-2xl p-4 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold text-white flex items-center">
                <i class="fa-solid fa-satellite-dish text-emerald-400 mr-1.5"></i>북미 인턴십 실시간 데이터 동기화
              </span>
              <span id="m-alert-pool-badge" class="font-quant text-[10px] px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold">Pool 705</span>
            </div>
            <p class="text-[11px] text-slate-300 leading-relaxed" id="m-alert-sync-desc">
              최근 수집 시각을 확인하는 중입니다...
            </p>
            <button onclick="UWMobile.handleLiveSync()"
              class="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold transition active:scale-95">
              <i class="fa-solid fa-arrows-rotate mr-1"></i> 지금 실시간 크롤링 동기화 실행
            </button>
          </div>

          <!-- KakaoTalk Share Hub -->
          <div class="uw-panel rounded-2xl p-4 space-y-2.5 border-[#FEE500]/30">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-extrabold text-[#FEE500] flex items-center">
                <i class="fa-solid fa-comment mr-1.5"></i>카카오톡 원터치 브리핑 공유
              </h3>
              <button onclick="UWMobile.openKakaoModal('dday')" class="text-[10.5px] text-slate-300 underline">미리보기·키설정</button>
            </div>
            <div class="space-y-2">
              <button onclick="UWMobile.triggerKakaoShare('dday')"
                class="w-full py-2.5 rounded-xl bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] text-xs font-extrabold shadow active:scale-95 transition">
                📅 1학년 & 2028 첫 코옵 D-Day 카톡 공유
              </button>
              <div class="grid grid-cols-2 gap-2">
                <button onclick="UWMobile.triggerKakaoShare('jobs')"
                  class="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-[#FEE500] border border-[#FEE500]/40 text-[11px] font-bold">
                  💼 추천공고 공유
                </button>
                <button onclick="UWMobile.triggerKakaoShare('link')"
                  class="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-bold">
                  📱 앱 링크 공유
                </button>
              </div>
            </div>
          </div>

          <!-- Telegram 24/7 Cloud Bot -->
          <div class="uw-panel rounded-2xl p-4 space-y-2.5">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-extrabold text-sky-300 flex items-center">
                <i class="fa-brands fa-telegram mr-1.5 text-sm"></i>24/7 텔레그램 자동 알림봇
              </h3>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold">매일 09:00 KST</span>
            </div>
            <p class="text-[11px] text-slate-300 leading-relaxed">
              노트북이 꺼져 있어도 GitHub 클라우드가 매일 아침 학사 D-Day와 신규 인턴십을 스마트폰으로 발송합니다.
            </p>
            <a href="https://t.me/Waterloo_career_alert_bot" target="_blank" rel="noopener noreferrer"
              class="block w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold text-center shadow">
              <i class="fa-brands fa-telegram mr-1"></i> @Waterloo_career_alert_bot 열기 ↗
            </a>
            <div class="grid grid-cols-2 gap-2 pt-0.5">
              <button onclick="UWMobile.handleTelegram('dday')"
                class="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-800/60 text-[11px] font-bold">
                D-Day 즉시 발송
              </button>
              <button onclick="UWMobile.handleTelegram('jobs')"
                class="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-800/60 text-[11px] font-bold">
                추천공고 즉시 발송
              </button>
            </div>
          </div>

          <!-- PWA Home Screen Guide -->
          <div class="uw-panel rounded-2xl p-3.5 space-y-1.5 text-[11px]">
            <div class="font-extrabold text-white">📲 스마트폰 홈 화면 앱(PWA) 설치 방법</div>
            <p class="text-slate-300">• <strong>iPhone (Safari)</strong>: 하단 <span class="text-uwGold font-semibold">[공유 ↑]</span> → <span class="text-white font-semibold">[홈 화면에 추가]</span></p>
            <p class="text-slate-300">• <strong>Android (Chrome)</strong>: 우측 상단 <span class="text-uwGold font-semibold">[⋮ 메뉴]</span> → <span class="text-white font-semibold">[앱 설치 / 홈 화면에 추가]</span></p>
          </div>

        </section>

      </main>

      <!-- Fixed 5-Tab Bottom Navigation Bar -->
      <nav class="fixed bottom-0 inset-x-0 z-40 bg-[#0B101D]/95 backdrop-blur-lg border-t border-slate-800/90 pb-safe">
        <div class="max-w-md mx-auto grid grid-cols-5 px-1 pt-1.5">
          <button onclick="UWMobile.switchTab('home')" id="m-nav-home" class="py-1.5 flex flex-col items-center justify-center text-uwGold">
            <i class="fa-solid fa-house text-sm"></i>
            <span class="text-[10px] font-extrabold mt-0.5">홈</span>
          </button>
          <button onclick="UWMobile.switchTab('jobs')" id="m-nav-jobs" class="py-1.5 flex flex-col items-center justify-center text-slate-400 relative">
            <i class="fa-solid fa-briefcase text-sm"></i>
            <span class="text-[10px] font-semibold mt-0.5">공고</span>
            <span id="m-nav-jobs-badge" class="font-quant absolute top-0.5 right-2.5 px-1 min-w-[16px] h-3.5 rounded-full bg-uwGold text-slate-950 text-[9px] font-extrabold flex items-center justify-center">29</span>
          </button>
          <button onclick="UWMobile.switchTab('tracks')" id="m-nav-tracks" class="py-1.5 flex flex-col items-center justify-center text-slate-400">
            <i class="fa-solid fa-compass text-sm"></i>
            <span class="text-[10px] font-semibold mt-0.5">트랙·일정</span>
          </button>
          <button onclick="UWMobile.switchTab('stats')" id="m-nav-stats" class="py-1.5 flex flex-col items-center justify-center text-slate-400">
            <i class="fa-solid fa-chart-simple text-sm"></i>
            <span class="text-[10px] font-semibold mt-0.5">통계·DB</span>
          </button>
          <button onclick="UWMobile.switchTab('alerts')" id="m-nav-alerts" class="py-1.5 flex flex-col items-center justify-center text-slate-400">
            <i class="fa-solid fa-bell text-sm"></i>
            <span class="text-[10px] font-semibold mt-0.5">알림·공유</span>
          </button>
        </div>
      </nav>

      <!-- Mobile Kakao Preview & Key Modal -->
      <div id="m-kakao-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm hidden flex items-end sm:items-center justify-center p-3">
        <div class="bg-slate-900 border border-[#FEE500]/50 rounded-3xl max-w-md w-full p-4 space-y-3 text-white max-h-[88vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span class="text-xs font-extrabold text-[#FEE500]"><i class="fa-solid fa-comment mr-1.5"></i>카카오톡 공유 브리핑 미리보기</span>
            <button onclick="UWMobile.closeKakaoModal()" class="w-7 h-7 rounded-full bg-slate-800 text-slate-300 text-xs">✕</button>
          </div>
          <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-48 overflow-y-auto custom-scrollbar">
            <pre id="m-kakao-preview" class="text-[11px] text-slate-200 whitespace-pre-wrap font-sans leading-relaxed select-all"></pre>
          </div>
          <div class="space-y-1.5 bg-slate-950/90 border border-slate-800 rounded-xl p-2.5">
            <div class="text-[10.5px] font-bold text-[#FEE500]">카카오 JavaScript SDK 키 (선택)</div>
            <div class="flex gap-1.5">
              <input id="m-kakao-key-input" type="text" placeholder="JavaScript 키 입력"
                class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none">
              <button onclick="UWMobile.saveKakaoKey()" class="px-3 py-1.5 bg-[#FEE500] text-[#191919] text-xs font-extrabold rounded-lg shrink-0">저장</button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button onclick="UWMobile.copyKakaoPreview(true)" class="py-2.5 rounded-xl bg-[#FEE500] text-[#191919] text-xs font-extrabold">
              복사 후 카톡 열기
            </button>
            <button onclick="UWMobile.copyKakaoPreview(false)" class="py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700">
              텍스트만 복사
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Toast -->
      <div id="m-toast" class="fixed bottom-20 inset-x-4 max-w-sm mx-auto bg-slate-900/95 border border-uwGold/50 text-white px-3.5 py-2.5 rounded-2xl shadow-2xl z-50 transform translate-y-16 opacity-0 transition duration-200 pointer-events-none">
        <div id="m-toast-title" class="text-xs font-extrabold text-uwGold">알림</div>
        <div id="m-toast-body" class="text-[11px] text-slate-200 mt-0.5 leading-snug"></div>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // Render Functions
  // ---------------------------------------------------------------------------
  function renderAll() {
    renderHome();
    renderJobsTab();
    renderTracksAndSchedule();
    renderStatsAndResources();
    renderAlertsTab();
    UWCore.updateAllDDayNodes();
  }

  function renderHome() {
    const profile = state.data.profile || {};
    const activeJobs = UWCore.getActivePostings(state.data.postings);
    const tracker = UWCore.getTrackerStats(activeJobs);
    const meta = profile.live_sync_metadata || {};

    const bmEl = document.getElementById('m-home-bm');
    const apEl = document.getElementById('m-home-ap');
    const syncEl = document.getElementById('m-home-sync-ts');
    const navBadge = document.getElementById('m-nav-jobs-badge');

    if (bmEl) bmEl.textContent = String(tracker.bookmarkedCount);
    if (apEl) apEl.textContent = String(tracker.appliedCount);
    if (navBadge) navBadge.textContent = String(activeJobs.length);
    if (syncEl) {
      const shortTs = (meta.last_synced_kst || '').slice(5, 16) || '최신 스냅샷';
      syncEl.textContent = `동기화 ${shortTs}`;
    }

    // Top-3 Urgent D-Days
    const upcoming = UWCore.getUpcomingAlerts(profile.d_day_alerts || []);
    const ddayBox = document.getElementById('m-home-ddays');
    if (ddayBox) {
      ddayBox.innerHTML = upcoming.slice(0, 3).map((a) => {
        const badgeCls = a.dday.isUrgent
          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          : 'bg-uwGold/15 text-uwGold border-uwGold/30';
        return `
          <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between gap-2">
            <div class="min-w-0">
              <div class="text-xs font-bold text-slate-100 leading-snug line-clamp-1">${UWCore.escapeHtml(a.title)}</div>
              <div class="font-quant text-[10px] text-slate-400 mt-0.5">${UWCore.escapeHtml(a.due_date)} · ${UWCore.escapeHtml(a.category || '')}</div>
            </div>
            <span class="font-quant text-[10.5px] font-extrabold px-2 py-0.5 rounded-lg border shrink-0 ${badgeCls}">
              ${UWCore.escapeHtml(a.dday.label)}
            </span>
          </div>
        `;
      }).join('');
    }

    // Checklist
    const chk = UWCore.getChecklistState(profile);
    const chkBadge = document.getElementById('m-chk-badge');
    const chkBar = document.getElementById('m-chk-bar');
    const chkList = document.getElementById('m-chk-list');
    if (chkBadge) chkBadge.textContent = `${chk.doneCount}/${chk.totalCount} (${chk.pct}%)`;
    if (chkBar) chkBar.style.width = `${chk.pct}%`;
    if (chkList) {
      chkList.innerHTML = chk.items.map((item) => `
        <div class="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/75 border border-slate-800/80 text-xs">
          <label class="flex items-start space-x-2.5 cursor-pointer flex-1 min-w-0">
            <input type="checkbox" ${item.done ? 'checked' : ''} onchange="UWMobile.toggleCheck('${item.id}', this.checked)"
              class="mt-0.5 w-4 h-4 rounded accent-[#F5C518] shrink-0">
            <span class="${item.done ? 'line-through text-slate-500' : 'text-slate-200'} leading-snug text-[11.5px]">
              <span class="px-1.5 py-0.2 mr-1 rounded bg-slate-800 text-[9.5px] font-bold text-uwGold">${UWCore.escapeHtml(item.phase)}</span>
              ${UWCore.escapeHtml(item.text)}
            </span>
          </label>
          ${item.isCustom ? `<button onclick="UWMobile.removeTodo('${item.id}')" class="text-slate-500 hover:text-rose-400 px-1 text-xs">✕</button>` : ''}
        </div>
      `).join('');
    }

    // Featured Top-3 Jobs
    const topJobs = UWCore.filterAndSortPostings(state.data.postings, { sortBy: 'recent' }).slice(0, 3);
    const topJobsBox = document.getElementById('m-home-top-jobs');
    if (topJobsBox) {
      topJobsBox.innerHTML = topJobs.map((j) => {
        const flag = j.country === 'CA' ? '🇨🇦' : '🇺🇸';
        return `
          <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
            <div class="min-w-0">
              <div class="flex items-center space-x-1.5">
                <span class="text-xs font-extrabold text-white truncate">${UWCore.escapeHtml(j.company)}</span>
                <span class="text-xs">${flag}</span>
              </div>
              <div class="text-[11px] text-uwGold font-semibold truncate">${UWCore.escapeHtml(j.title)}</div>
              <div class="font-quant text-[10px] text-emerald-400 font-bold mt-0.5">${UWCore.escapeHtml(j.hourly_rate)}</div>
            </div>
            <a href="${UWCore.escapeHtml(j.url)}" target="_blank" rel="noopener noreferrer"
              class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-uwGold text-uwGold hover:text-slate-950 text-[10.5px] font-extrabold border border-slate-700 shrink-0 transition">
              지원 ↗
            </a>
          </div>
        `;
      }).join('');
    }
  }

  function renderJobsTab() {
    const activeJobs = UWCore.getActivePostings(state.data.postings);
    const tracker = UWCore.getTrackerStats(activeJobs);
    const caCount = activeJobs.filter((j) => j.country === 'CA').length;
    const usCount = activeJobs.filter((j) => j.country === 'US').length;

    const scChips = document.getElementById('m-status-country-chips');
    if (scChips) {
      const chipBtn = (active, onClick, label) => `
        <button onclick="${onClick}" class="px-2.5 py-1 rounded-lg whitespace-nowrap font-bold transition ${
          active ? 'bg-uwGold text-slate-950 shadow' : 'bg-slate-900 text-slate-300 border border-slate-800'
        }">${label}</button>
      `;
      scChips.innerHTML = [
        chipBtn(state.country === 'ALL' && state.status === 'ALL', "UWMobile.setQuickFilter('ALL','ALL')", `전체 ${activeJobs.length}`),
        chipBtn(state.status === 'BOOKMARKED', "UWMobile.setQuickFilter('ALL','BOOKMARKED')", `⭐ 관심 ${tracker.bookmarkedCount}`),
        chipBtn(state.status === 'APPLIED', "UWMobile.setQuickFilter('ALL','APPLIED')", `✅ 지원완료 ${tracker.appliedCount}`),
        chipBtn(state.country === 'CA' && state.status === 'ALL', "UWMobile.setQuickFilter('CA','ALL')", `🇨🇦 캐나다 ${caCount}`),
        chipBtn(state.country === 'US' && state.status === 'ALL', "UWMobile.setQuickFilter('US','ALL')", `🇺🇸 미국 ${usCount}`)
      ].join('');
    }

    const trChips = document.getElementById('m-track-chips');
    if (trChips) {
      const tracks = [
        { id: 'ALL', label: '전직무' },
        { id: 'quant', label: '퀀트·금융' },
        { id: 'data_ai', label: '데이터·AI' },
        { id: 'software', label: '소프트웨어' },
        { id: 'actuary', label: '보험계리' }
      ];
      trChips.innerHTML = tracks.map((t) => `
        <button onclick="UWMobile.setTrack('${t.id}')" class="px-2.5 py-1 rounded-lg whitespace-nowrap font-bold transition ${
          state.track === t.id
            ? 'bg-mathPink text-white shadow'
            : 'bg-slate-950 text-slate-400 border border-slate-800'
        }">${t.label}</button>
      `).join('');
    }

    const filtered = UWCore.filterAndSortPostings(state.data.postings, {
      country: state.country,
      track: state.track,
      status: state.status,
      query: state.query,
      sortBy: state.sortBy
    });

    const poolTotal = (((state.data.profile || {}).live_sync_metadata || {}).live_jobs_stats || {}).total_open_na_roles || 705;
    const countLabel = document.getElementById('m-jobs-count-label');
    if (countLabel) {
      countLabel.textContent = `${filtered.length}건 표시 · 북미 Pool ${poolTotal}건`;
    }

    const listEl = document.getElementById('m-jobs-list');
    if (!listEl) return;

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="uw-panel rounded-2xl p-8 text-center space-y-2">
          <div class="text-xs font-bold text-slate-300">일치하는 공고가 없습니다.</div>
          <button onclick="UWMobile.resetFilters()" class="px-3 py-1.5 rounded-xl bg-slate-800 text-uwGold text-xs font-bold border border-slate-700">
            필터 초기화
          </button>
        </div>
      `;
      return;
    }

    const trackNames = { quant: '퀀트', data_ai: '데이터·AI', software: 'SW', actuary: '보험계리' };

    listEl.innerHTML = filtered.map((job) => {
      const flag = job.country === 'CA' ? '🇨🇦' : '🇺🇸';
      const accent = job.isApplied ? 'uw-card-applied' : (job.isBookmarked ? 'uw-card-bookmarked' : '');
      return `
        <article class="uw-card ${accent} rounded-2xl p-3.5 space-y-2">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <div class="flex items-center flex-wrap gap-1">
                <span class="text-xs font-extrabold text-white">${UWCore.escapeHtml(job.company)}</span>
                <span class="text-xs">${flag}</span>
                <span class="px-1.5 py-0.2 rounded bg-slate-800 text-uwGold text-[9.5px] font-bold">${trackNames[job.track] || job.track}</span>
                ${job.age_label ? `<span class="font-quant text-[9.5px] text-slate-400">${UWCore.escapeHtml(job.age_label)} 전</span>` : ''}
              </div>
              <h3 class="text-xs font-bold text-uwGold mt-0.5 leading-snug">${UWCore.escapeHtml(job.title)}</h3>
            </div>
            <div class="text-right shrink-0">
              <div class="font-quant text-[11px] font-extrabold text-emerald-400">${UWCore.escapeHtml(job.hourly_rate)}</div>
              <div class="font-quant text-[9.5px] text-slate-400">${UWCore.escapeHtml(job.dday.label)}</div>
            </div>
          </div>

          <div class="text-[10.5px] text-slate-400 flex flex-wrap gap-x-2.5 gap-y-0.5">
            <span>📍 ${UWCore.escapeHtml(job.location)}</span>
            <span class="text-emerald-300">🛂 ${UWCore.escapeHtml(job.visa_sponsorship)}</span>
          </div>

          <div class="flex flex-wrap gap-1">
            ${(job.tags || []).map((t) => `
              <button onclick="UWMobile.searchByTag('${UWCore.escapeHtml(t)}')"
                class="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[9.5px]">#${UWCore.escapeHtml(t)}</button>
            `).join('')}
          </div>

          <div class="pt-2 border-t border-slate-800/80 grid grid-cols-4 gap-1.5 text-[11px]">
            <button onclick="UWMobile.toggleBookmark('${job.id}')"
              class="py-1.5 rounded-xl font-bold border text-center ${job.isBookmarked ? 'bg-uwGold/20 text-uwGold border-uwGold/50' : 'bg-slate-900 text-slate-300 border-slate-800'}">
              ${job.isBookmarked ? '⭐ 저장됨' : '☆ 관심'}
            </button>
            <button onclick="UWMobile.toggleApplied('${job.id}')"
              class="py-1.5 rounded-xl font-bold border text-center ${job.isApplied ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-slate-900 text-slate-300 border-slate-800'}">
              ${job.isApplied ? '✅ 지원됨' : '지원체크'}
            </button>
            <button onclick="UWMobile.shareSingleJob('${job.id}')"
              class="py-1.5 rounded-xl bg-[#FEE500] text-[#191919] font-extrabold text-center">
              카톡
            </button>
            <a href="${UWCore.escapeHtml(job.url)}" target="_blank" rel="noopener noreferrer"
              class="py-1.5 rounded-xl bg-uwGold text-slate-950 font-extrabold text-center">
              지원 ↗
            </a>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderTracksAndSchedule() {
    const profile = state.data.profile || {};

    // 1. Full 15 D-Day List
    const upcoming = UWCore.getUpcomingAlerts(profile.d_day_alerts || []).filter((a) => {
      if (state.scheduleFilter === 'ALL') return true;
      if (state.scheduleFilter === 'target_2028') return a.phase_group === 'target_2028' || String(a.due_date) >= '2027-07-01';
      return a.phase_group === 'short_term' && String(a.due_date) < '2027-07-01';
    });
    const ddayEl = document.getElementById('m-full-dday-list');
    if (ddayEl) {
      ddayEl.innerHTML = upcoming.map((a) => {
        const is2028 = a.phase_group === 'target_2028' || String(a.due_date).startsWith('2028-');
        const cls = a.dday.isUrgent
          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          : (is2028 ? 'bg-mathPink/20 text-pink-300 border-mathPink/40' : 'bg-slate-800 text-uwGold border-slate-700');
        return `
          <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
            <div class="min-w-0">
              <div class="text-xs font-bold text-slate-100 leading-snug">${UWCore.escapeHtml(a.title)}</div>
              <div class="font-quant text-[10px] text-slate-400 mt-0.5">${UWCore.escapeHtml(a.due_date)} · ${UWCore.escapeHtml(a.category || '')}</div>
            </div>
            <span class="font-quant text-[10.5px] font-extrabold px-2 py-1 rounded-lg border shrink-0 ${cls}">
              ${UWCore.escapeHtml(a.dday.label)}
            </span>
          </div>
        `;
      }).join('');
    }

    // 2. 4-Phase Roadmap
    const roadmapEl = document.getElementById('m-tracks-roadmap-box');
    if (roadmapEl) {
      roadmapEl.innerHTML = (profile.waterloo_coop_timeline || []).map((step) => {
        const isNow = step.status === 'In Progress';
        const isTarget = String(step.status).includes('2028');
        return `
          <div class="uw-panel rounded-2xl p-3.5 space-y-1.5 ${isNow ? 'border-uwGold/50' : (isTarget ? 'border-mathPink/50' : '')}">
            <div class="flex items-center justify-between">
              <span class="font-quant text-[10.5px] font-bold text-uwGold">${UWCore.escapeHtml(step.phase)}</span>
              <span class="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold ${isNow ? 'bg-uwGold text-slate-950' : (isTarget ? 'bg-mathPink text-white' : 'bg-slate-800 text-slate-300')}">
                ${UWCore.escapeHtml(step.status)}
              </span>
            </div>
            <div class="text-xs font-extrabold text-white">${UWCore.escapeHtml(step.title)}</div>
            <p class="text-[11px] text-slate-300 leading-relaxed">${UWCore.escapeHtml(step.description)}</p>
            <ul class="list-disc list-inside text-[11px] text-slate-300 space-y-0.5 pt-1">
              ${(step.action_items || []).map((it) => `<li>${UWCore.escapeHtml(it)}</li>`).join('')}
            </ul>
          </div>
        `;
      }).join('');
    }

    // 3. 4 Career Tracks Matrix
    const careerEl = document.getElementById('m-tracks-career-box');
    if (careerEl) {
      const tracks = (profile.student || {}).career_tracks || [];
      careerEl.innerHTML = tracks.map((tr) => `
        <div class="uw-panel rounded-2xl p-3.5 space-y-2">
          <div class="flex items-start justify-between gap-2">
            <div>
              <h4 class="text-xs font-extrabold text-white">${UWCore.escapeHtml(tr.kor_name || tr.name)}</h4>
              <div class="text-[10.5px] text-uwGold font-medium">${UWCore.escapeHtml(tr.name)}</div>
            </div>
            <button onclick="UWMobile.jumpToTrackJobs('${tr.id}')"
              class="px-2.5 py-1 rounded-lg bg-uwGold text-slate-950 text-[10.5px] font-extrabold shrink-0">
              공고 보기 →
            </button>
          </div>
          <p class="text-[11px] text-slate-300 leading-relaxed">${UWCore.escapeHtml(tr.description)}</p>
          <div class="flex flex-wrap gap-1">
            ${(tr.target_majors || []).map((m) => `<span class="px-2 py-0.5 rounded bg-slate-950 text-pink-300 border border-mathPink/30 text-[10px] font-semibold">${UWCore.escapeHtml(m)}</span>`).join('')}
          </div>
          ${tr.first_year_courses ? `
            <div class="flex flex-wrap gap-1">
              ${tr.first_year_courses.map((c) => `<span class="font-quant px-2 py-0.5 rounded bg-slate-900 text-sky-300 text-[9.5px]">${UWCore.escapeHtml(c)}</span>`).join('')}
            </div>
          ` : ''}
          <div class="flex flex-wrap gap-1">
            ${(tr.top_employers || []).map((emp) => `
              <button onclick="UWMobile.searchByTag('${UWCore.escapeHtml(emp.split(' ')[0])}')"
                class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 text-[10px] font-semibold">
                🏢 ${UWCore.escapeHtml(emp)}
              </button>
            `).join('')}
          </div>
        </div>
      `).join('');
    }
  }

  function renderStatsAndResources() {
    const profile = state.data.profile || {};
    const stats = profile.coop_statistics || {};
    const empBadge = document.getElementById('m-emp-rate-badge');
    if (empBadge) empBadge.textContent = `취업률 ${stats.employment_rate || '96.4%'}`;

    const earnings = stats.average_hourly_earnings_cad || {};
    const labels = Object.keys(earnings).map((k) => k.replace('Work Term ', 'WT'));
    const values = Object.values(earnings);

    const canvas = document.getElementById('mEarningsChart');
    if (canvas && window.Chart) {
      if (state.chartInstance) state.chartInstance.destroy();
      state.chartInstance = new window.Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: labels.length ? labels : ['WT1', 'WT2', 'WT3', 'WT4', 'WT5', 'WT6'],
          datasets: [{
            data: values.length ? values : [23.4, 26.85, 30.2, 34.5, 38.8, 43.1],
            backgroundColor: ['#F5C518', '#F5C518', '#F59E0B', '#EC4899', '#EC4899', '#F472B6'],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#CBD5E1', font: { size: 10 } } },
            y: { grid: { color: '#1E293B' }, ticks: { color: '#94A3B8', font: { size: 10 }, callback: (v) => `$${v}` } }
          }
        }
      });
    }

    const renderBars = (obj, elId, barColor) => {
      const el = document.getElementById(elId);
      if (!el) return;
      el.innerHTML = Object.entries(obj || {}).map(([k, v]) => {
        const pct = parseInt(String(v).replace(/[^0-9]/g, ''), 10) || 0;
        return `
          <div class="space-y-0.5">
            <div class="flex justify-between text-[11px]">
              <span class="text-slate-300 truncate pr-2">${UWCore.escapeHtml(k)}</span>
              <span class="font-quant font-bold text-white">${pct}%</span>
            </div>
            <div class="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full ${barColor} rounded-full" style="width:${pct}%"></div>
            </div>
          </div>
        `;
      }).join('');
    };

    renderBars(stats.regional_distribution, 'm-regional-bars', 'bg-uwGold');
    renderBars(stats.faculty_breakdown_percentages, 'm-sector-bars', 'bg-mathPink');

    const visaEl = document.getElementById('m-visa-cards');
    if (visaEl) {
      visaEl.innerHTML = Object.values(profile.visa_guide || {}).map((v) => `
        <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-extrabold text-white">${UWCore.escapeHtml(v.title)}</span>
            ${v.badge ? `<span class="px-2 py-0.5 rounded bg-uwGold/15 text-uwGold text-[9.5px] font-bold shrink-0">${UWCore.escapeHtml(v.badge)}</span>` : ''}
          </div>
          <p class="text-[11px] text-slate-300 leading-relaxed">${UWCore.escapeHtml(v.summary)}</p>
          <p class="text-[10.5px] text-emerald-300 font-semibold">💡 ${UWCore.escapeHtml(v.key_point)}</p>
        </div>
      `).join('');
    }

    // All 13 Official DB Resources
    const dbEl = document.getElementById('m-stats-db-box');
    if (dbEl) {
      const cats = (state.data.resources || {}).categories || [];
      dbEl.innerHTML = cats.map((cat) => `
        <div class="uw-panel rounded-2xl p-3.5 space-y-2">
          <div>
            <h4 class="text-xs font-extrabold text-uwGold">${UWCore.escapeHtml(cat.name)}</h4>
            <p class="text-[10.5px] text-slate-400">${UWCore.escapeHtml(cat.description)}</p>
          </div>
          <div class="space-y-2">
            ${(cat.resources || []).map((r) => `
              <a href="${UWCore.escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer"
                class="block p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs font-bold text-white">${UWCore.escapeHtml(r.name)} ↗</span>
                  <span class="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">${UWCore.escapeHtml(r.issuer)}</span>
                </div>
                <p class="text-[10.5px] text-slate-300">${UWCore.escapeHtml(r.purpose)}</p>
                <p class="text-[10px] text-pink-300 font-medium">🎯 ${UWCore.escapeHtml(r.math_action)}</p>
              </a>
            `).join('')}
          </div>
        </div>
      `).join('');
    }
  }

  function renderAlertsTab() {
    const meta = (state.data.profile || {}).live_sync_metadata || {};
    const stats = meta.live_jobs_stats || {};
    const poolEl = document.getElementById('m-alert-pool-badge');
    const descEl = document.getElementById('m-alert-sync-desc');
    if (poolEl && stats.total_open_na_roles) {
      poolEl.textContent = `북미 Pool ${stats.total_open_na_roles}건`;
    }
    if (descEl) {
      descEl.textContent = `최근 동기화: ${meta.last_synced_kst || '최신 스냅샷'} · 캐나다 오픈 ${stats.canada_open_roles || 44}건 포함`;
    }
  }

  // ---------------------------------------------------------------------------
  // Interactive Actions
  // ---------------------------------------------------------------------------
  function switchTab(tab) {
    state.activeTab = tab;
    ['home', 'jobs', 'tracks', 'stats', 'alerts'].forEach((t) => {
      const pane = document.getElementById(`m-pane-${t}`);
      const nav = document.getElementById(`m-nav-${t}`);
      if (pane) pane.classList.toggle('active', t === tab);
      if (nav) {
        nav.className = t === tab
          ? 'py-1.5 flex flex-col items-center justify-center text-uwGold relative'
          : 'py-1.5 flex flex-col items-center justify-center text-slate-400 relative';
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (tab === 'stats' && state.statsSubView === 'metrics') {
      setTimeout(renderStatsAndResources, 40);
    }
  }

  function setTracksSubView(view) {
    state.tracksSubView = view;
    const map = { dday: 'm-tracks-dday-box', roadmap: 'm-tracks-roadmap-box', career: 'm-tracks-career-box' };
    Object.entries(map).forEach(([k, id]) => {
      const el = document.getElementById(id);
      const btn = document.getElementById(`m-tsub-${k}`);
      if (el) el.classList.toggle('hidden', k !== view);
      if (btn) {
        btn.className = k === view
          ? 'py-2 rounded-lg font-extrabold bg-uwGold text-slate-950'
          : 'py-2 rounded-lg font-semibold text-slate-400';
      }
    });
  }

  function setStatsSubView(view) {
    state.statsSubView = view;
    document.getElementById('m-stats-metrics-box').classList.toggle('hidden', view !== 'metrics');
    document.getElementById('m-stats-db-box').classList.toggle('hidden', view !== 'db');
    document.getElementById('m-ssub-metrics').className = view === 'metrics'
      ? 'py-2 rounded-lg font-extrabold bg-uwGold text-slate-950'
      : 'py-2 rounded-lg font-semibold text-slate-400';
    document.getElementById('m-ssub-db').className = view === 'db'
      ? 'py-2 rounded-lg font-extrabold bg-uwGold text-slate-950'
      : 'py-2 rounded-lg font-semibold text-slate-400';
  }

  function openScheduleFull() {
    switchTab('tracks');
    setTracksSubView('dday');
  }

  function setScheduleFilter(f) {
    state.scheduleFilter = f;
    ['ALL', 'short_term', 'target_2028'].forEach((k) => {
      const btn = document.getElementById(`m-sf-${k}`);
      if (btn) {
        btn.className = k === f
          ? 'px-2 py-0.5 rounded bg-uwGold text-slate-950 font-extrabold'
          : 'px-2 py-0.5 rounded text-slate-400';
      }
    });
    renderTracksAndSchedule();
  }

  function setQuickFilter(country, status) {
    state.country = country;
    state.status = status;
    renderJobsTab();
  }

  function setTrack(track) {
    state.track = track;
    renderJobsTab();
  }

  function jumpToSavedJobs(status) {
    state.country = 'ALL';
    state.track = 'ALL';
    state.status = status;
    renderJobsTab();
    switchTab('jobs');
  }

  function jumpToTrackJobs(trackId) {
    state.country = 'ALL';
    state.status = 'ALL';
    state.track = trackId;
    renderJobsTab();
    switchTab('jobs');
  }

  function handleSearch(val) {
    state.query = val;
    const clr = document.getElementById('m-clear-search');
    if (clr) clr.classList.toggle('hidden', !val);
    renderJobsTab();
  }

  function clearSearch() {
    const inp = document.getElementById('m-job-search');
    if (inp) inp.value = '';
    handleSearch('');
  }

  function searchByTag(tag) {
    state.country = 'ALL';
    state.track = 'ALL';
    state.status = 'ALL';
    switchTab('jobs');
    const inp = document.getElementById('m-job-search');
    if (inp) inp.value = tag;
    handleSearch(tag);
  }

  function resetFilters() {
    state.country = 'ALL';
    state.track = 'ALL';
    state.status = 'ALL';
    clearSearch();
    renderJobsTab();
  }

  function handleSort(val) {
    state.sortBy = val;
    renderJobsTab();
  }

  function toggleBookmark(jobId) {
    const added = UWCore.toggleBookmark(jobId);
    showToast(added ? '⭐ 관심 공고 저장' : '관심 공고 해제', added ? '[공고 → ⭐ 관심]에서 모아볼 수 있습니다.' : '관심 목록에서 제외되었습니다.');
  }

  function toggleApplied(jobId) {
    const added = UWCore.toggleApplied(jobId);
    showToast(added ? '✅ 지원 완료 체크!' : '지원 완료 해제', added ? '내 지원 파이프라인에 기록되었습니다.' : '미지원 상태로 변경되었습니다.');
  }

  function toggleCheck(id, checked) {
    UWCore.setChecklistDone(id, checked, state.data.profile);
  }

  function handleAddTodo(e) {
    e.preventDefault();
    const inp = document.getElementById('m-todo-input');
    if (inp && UWCore.addCustomTodo(inp.value, '내 목표')) {
      inp.value = '';
      showToast('체크리스트 추가 완료', '기기에 자동 저장되었습니다.');
    }
  }

  function removeTodo(id) {
    UWCore.removeCustomTodo(id);
  }

  async function handleLiveSync() {
    const icon = document.getElementById('m-sync-icon');
    if (icon) icon.classList.add('fa-spin');
    showToast('실시간 동기화 중...', '북미 인턴십 및 공식 일정을 확인합니다.');
    const res = await UWCore.triggerLiveSync();
    if (icon) icon.classList.remove('fa-spin');
    if (res.success) {
      state.data = await UWCore.loadAllData(DATA_PREFIX);
      renderAll();
      showToast('실시간 동기화 완료!', `맞춤 공고 ${res.postings_count}건 최신화 완료`);
    } else {
      showToast('동기화 안내', res.message || '클라우드 자동 동기화 모드입니다.');
    }
  }

  async function handleTelegram(type) {
    showToast('텔레그램 발송 요청...', '알림봇으로 전송 중입니다.');
    const res = await UWCore.triggerTelegramAlert(type);
    if (res.success) {
      showToast('텔레그램 전송 완료!', res.mode === 'dry-run' ? '모의 발송(Dry-run) 완료' : '스마트폰 텔레그램을 확인하세요.');
    } else {
      showToast('텔레그램 안내', res.message || '클라우드에서 매일 09:00 자동 발송됩니다.');
    }
  }

  // Kakao Share
  function openKakaoModal(type = 'dday', jobId = null) {
    state.kakaoType = type;
    state.kakaoJobId = jobId;
    document.getElementById('m-kakao-preview').textContent = UWCore.buildShareMessage(type, state.data, jobId);
    document.getElementById('m-kakao-key-input').value = UWCore.getKakaoKey();
    document.getElementById('m-kakao-modal').classList.remove('hidden');
  }

  function closeKakaoModal() {
    document.getElementById('m-kakao-modal').classList.add('hidden');
  }

  async function saveKakaoKey() {
    const val = document.getElementById('m-kakao-key-input').value;
    const ok = await UWCore.saveKakaoKey(val);
    if (ok) {
      showToast('카카오 SDK 연동 완료', '공유 창을 호출합니다.');
      UWCore.sendKakaoSdkFeed(state.kakaoType, state.data, state.kakaoJobId);
    } else {
      showToast('키 확인 필요', '유효한 카카오 JavaScript 키를 입력하세요.');
    }
  }

  async function triggerKakaoShare(type = 'dday') {
    const text = UWCore.buildShareMessage(type, state.data, null);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text).catch(() => {});
    }
    if (UWCore.sendKakaoSdkFeed(type, state.data, null)) {
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Waterloo Math 2028 브리핑', text });
        return;
      } catch (_) {}
    }
    openKakaoModal(type, null);
  }

  async function shareSingleJob(jobId) {
    const text = UWCore.buildShareMessage('single_job', state.data, jobId);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text).catch(() => {});
    }
    if (UWCore.sendKakaoSdkFeed('single_job', state.data, jobId)) {
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Waterloo Math 추천 인턴십', text });
        return;
      } catch (_) {}
    }
    openKakaoModal('single_job', jobId);
  }

  async function copyKakaoPreview(openApp) {
    const text = document.getElementById('m-kakao-preview').textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text).catch(() => {});
    }
    showToast('복사 완료!', '카카오톡 대화창에 붙여넣기 하세요.');
    if (openApp) {
      setTimeout(() => { window.location.href = 'kakaotalk://'; }, 220);
    }
  }

  let toastTimer = null;
  function showToast(title, body) {
    const el = document.getElementById('m-toast');
    if (!el) return;
    document.getElementById('m-toast-title').textContent = title;
    document.getElementById('m-toast-body').textContent = body;
    el.classList.remove('translate-y-16', 'opacity-0');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.add('translate-y-16', 'opacity-0');
    }, 3000);
  }

  // Expose public controller methods
  window.UWMobile = {
    switchTab,
    setTracksSubView,
    setStatsSubView,
    openScheduleFull,
    setScheduleFilter,
    setQuickFilter,
    setTrack,
    jumpToSavedJobs,
    jumpToTrackJobs,
    handleSearch,
    clearSearch,
    searchByTag,
    resetFilters,
    handleSort,
    toggleBookmark,
    toggleApplied,
    toggleCheck,
    handleAddTodo,
    removeTodo,
    handleLiveSync,
    handleTelegram,
    openKakaoModal,
    closeKakaoModal,
    saveKakaoKey,
    triggerKakaoShare,
    shareSingleJob,
    copyKakaoPreview
  };

  async function boot() {
    mountShell();
    renderAll(); // Instant render using offline snapshot before network completes
    state.data = await UWCore.loadAllData(DATA_PREFIX);
    await UWCore.syncKakaoKeyFromServer();
    renderAll();
    setInterval(UWCore.updateAllDDayNodes, 60 * 1000);

    const onSyncState = () => {
      renderHome();
      renderJobsTab();
    };
    window.addEventListener('uw-state-change', onSyncState);
    window.addEventListener('storage', onSyncState);

    const params = new URLSearchParams(window.location.search);
    const shareParam = params.get('share');
    if (shareParam === 'dday' || shareParam === 'jobs' || shareParam === 'link') {
      triggerKakaoShare(shareParam);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window, document);
