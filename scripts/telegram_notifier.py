#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Waterloo Math Career - Telegram Notification Module
워털루 대학교 수학과 1학년 학생 맞춤형 실시간 인턴십 및 공식 코옵 전체 일정 알림 엔진
"""

import os
import sys
import time
import json
import urllib.request
import urllib.parse
from datetime import datetime, timedelta, timezone

# 한국 표준시 (KST, UTC+9) - D-Day 계산 기준 시간대
KST = timezone(timedelta(hours=9), name="KST")

# Windows 콘솔 유니코드 이모지 인코딩 에러 방지
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
sys.path.append(CURRENT_DIR)

CONFIG_PATH = os.path.join(PROJECT_ROOT, "config", "telegram_config.json")
LOCAL_CONFIG_PATH = os.path.join(PROJECT_ROOT, "config", "telegram_config.local.json")
PROFILE_PATH = os.path.join(PROJECT_ROOT, "data", "waterloo_math_profile.json")
POSTINGS_PATH = os.path.join(PROJECT_ROOT, "data", "internship_postings.json")

try:
    import live_crawler
except ImportError:
    live_crawler = None


def load_json(filepath):
    if not os.path.exists(filepath):
        return {}
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def send_telegram_message(message_text, parse_mode="HTML"):
    """
    텔레그램 봇 API를 호출하여 메시지를 전송합니다.
    일시적 네트워크 리셋(WinError 10054 등)에 대비하여 최대 3회 재시도합니다.
    """
    cfg_file = LOCAL_CONFIG_PATH if os.path.exists(LOCAL_CONFIG_PATH) else CONFIG_PATH
    config = load_json(cfg_file)
    tg_config = config.get("telegram", {})
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN") or tg_config.get("bot_token", "")
    chat_id = str(os.environ.get("TELEGRAM_CHAT_ID") or tg_config.get("chat_id", ""))
    enabled = True if os.environ.get("TELEGRAM_BOT_TOKEN") else tg_config.get("enabled", False)

    # Dry-run 모드 체크
    if (
        not enabled
        or not bot_token
        or bot_token.startswith("YOUR_TELEGRAM_")
        or not chat_id
        or chat_id.startswith("YOUR_TELEGRAM_")
    ):
        timestamp = datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S")
        print("\n" + "=" * 60)
        print(f"🔔 [TELEGRAM SIMULATION / DRY-RUN] - {timestamp} KST")
        print("ℹ️  안내: 실제 발송을 원하시면 config/telegram_config.json 에 토큰을 입력하세요.")
        print("-" * 60)
        print(message_text)
        print("=" * 60 + "\n")
        return {
            "success": True,
            "mode": "dry-run",
            "message": "Dry-run 시뮬레이션으로 콘솔에 메시지가 출력되었습니다. (토큰 미설정 상태)",
        }

    api_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message_text,
        "parse_mode": parse_mode,
        "disable_web_page_preview": True,
    }
    data = json.dumps(payload).encode("utf-8")

    last_err = None
    for attempt in range(1, 4):
        req = urllib.request.Request(
            api_url,
            data=data,
            headers={"Content-Type": "application/json", "Connection": "close"},
        )
        try:
            with urllib.request.urlopen(req, timeout=12) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                if result.get("ok"):
                    print("✅ [TELEGRAM SUCCESS] 텔레그램 메시지가 사용자님 휴대폰으로 성공적으로 발송되었습니다!")
                    return {"success": True, "mode": "real", "message": "텔레그램 메시지가 성공적으로 발송되었습니다."}
                desc = result.get("description")
                print(f"❌ [TELEGRAM ERROR] {desc}")
                return {"success": False, "mode": "real", "error": desc}
        except Exception as e:
            last_err = e
            if attempt < 3:
                time.sleep(1.5 * attempt)

    print(f"❌ [TELEGRAM EXCEPTION] {last_err}")
    return {"success": False, "mode": "real", "error": str(last_err)}


def today_kst():
    """한국 시간(KST, UTC+9) 기준 오늘 날짜를 반환합니다."""
    return datetime.now(KST).date()


def compute_d_day(due_date_str, base_date=None):
    """
    마감일(YYYY-MM-DD)과 기준일(기본: 오늘 KST)의 차이로 D-Day 라벨을 계산합니다.
    """
    base_date = base_date or today_kst()
    try:
        due = datetime.strptime(str(due_date_str), "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None, "D-?"
    days_left = (due - base_date).days
    if days_left > 0:
        return days_left, f"D-{days_left}"
    if days_left == 0:
        return 0, "D-Day"
    return days_left, f"마감 D+{-days_left}"


def ensure_live_sync():
    """알림 발송 전 실시간 크롤러를 호출하여 최신 공고 및 워털루 공식 학사 일정을 동기화합니다."""
    if live_crawler is not None:
        try:
            return live_crawler.sync_all_data()
        except Exception as e:
            print(f"⚠️ [SYNC WARNING] 실시간 동기화 중 예외 발생 (기존 데이터 사용): {e}")
    return None


def notify_d_day_alerts(sync_first=True):
    """
    워털루 대학교 공식 Co-op 학사 일정 전체(2026 가을 ~ 2027 겨울/봄 학기)에 대한
    실시간 D-Day 브리핑 메시지를 생성 및 발송합니다. (마감 지난 일정 자동 제외)
    """
    if sync_first:
        ensure_live_sync()

    profile = load_json(PROFILE_PATH)
    d_days = profile.get("d_day_alerts", [])
    base_date = today_kst()

    active_alerts = []
    for alert in sorted(d_days, key=lambda a: str(a.get("due_date", ""))):
        days_left, badge = compute_d_day(alert.get("due_date"), base_date)
        if days_left is not None and days_left < 0:
            continue
        active_alerts.append((alert, days_left, badge))

    if not active_alerts:
        print(f"ℹ️ [SKIP] 기준일({base_date.isoformat()}) 현재 진행 중인 마감 일정이 없어 발송을 건너뜁니다.")
        return {"success": True, "mode": "skipped", "message": "진행 중인 마감 일정이 없습니다."}

    fall_2026 = [(a, d, b) for a, d, b in active_alerts if str(a.get("due_date", "")).startswith("2026-")]
    winter_2027 = [(a, d, b) for a, d, b in active_alerts if str(a.get("due_date", "")).startswith("2027-")]

    lines = [
        "🎓 <b>[Waterloo Math] 공식 Co-op & 학사 전체 일정 D-Day 브리핑</b>",
        "──────────────────────────────",
        f"📅 기준일: <code>{base_date.isoformat()}</code> (KST) | 총 <b>{len(active_alerts)}건</b> 진행 중\n",
    ]

    if fall_2026:
        lines.append("🔥 <b>[1] 2026 가을학기(1A) · 비자 · 잔여 라운드</b>")
        for alert, days_left, badge in fall_2026:
            icon = "🔴" if (days_left is not None and days_left <= 18) or alert.get("urgency") == "high" else "🟡"
            lines.append(f"{icon} <b>{alert.get('title')}</b>")
            lines.append(f"   • 일자: <code>{alert.get('due_date')}</code> (<b>{badge}</b>)")
        lines.append("")

    if winter_2027:
        lines.append("🚀 <b>[2] 2027 겨울학기(1B) · 첫 코옵(Spring 2027) 공식 일정</b>")
        for alert, days_left, badge in winter_2027:
            icon = "🔴" if alert.get("urgency") == "high" else "🟡"
            lines.append(f"{icon} <b>{alert.get('title')}</b>")
            lines.append(f"   • 일자: <code>{alert.get('due_date')}</code> (<b>{badge}</b>)")
        lines.append("")

    lines.append("──────────────────────────────")
    lines.append("🌐 <a href='https://uwaterloo.ca/co-operative-education/important-dates'>워털루 대학교 공식 Co-op 일정 원문 보기</a>")
    lines.append("📱 👉 <a href='https://dongfal07.github.io/waterloo-math-career-dashboard/'>워털루 커리어 대시보드 열기</a>")
    msg = "\n".join(lines)
    return send_telegram_message(msg)


def notify_job_postings(limit=15, sync_first=True):
    """
    실시간 수집된 북미(캐나다/미국) 인턴십·코옵 오픈 공고를 트랙별·국가별로 종합 발송합니다.
    """
    if sync_first:
        ensure_live_sync()

    postings = load_json(POSTINGS_PATH)
    profile = load_json(PROFILE_PATH)
    sync_meta = profile.get("live_sync_metadata", {})
    stats = sync_meta.get("live_jobs_stats", {})
    base_date = today_kst()

    active_postings = []
    for job in postings:
        days_left, badge = compute_d_day(job.get("deadline"), base_date)
        if days_left is not None and days_left < 0:
            continue
        active_postings.append((job, days_left, badge))

    if not active_postings:
        print(f"ℹ️ [SKIP] 기준일({base_date.isoformat()}) 현재 지원 가능한 공고가 없어 발송을 건너뜁니다.")
        return {"success": True, "mode": "skipped", "message": "지원 가능한 활성 공고가 없습니다."}

    total_open = stats.get("total_open_na_roles", len(active_postings))
    ca_open = stats.get("canada_open_roles", len([j for j, _, _ in active_postings if j.get("country") == "CA"]))

    lines = [
        "💼 <b>[Waterloo Math] 실시간 북미 인턴십 & Co-op 채용 브리핑</b>",
        "──────────────────────────────",
        f"📅 수집 기준: <code>{base_date.isoformat()}</code> (KST)",
        f"📊 북미 실시간 오픈 공고: <b>총 {total_open}건</b> (🇨🇦 캐나다 <b>{ca_open}건</b> 포함)\n",
    ]

    ca_list = [(j, d, b) for j, d, b in active_postings if j.get("country") == "CA"][:6]
    quant_act_list = [
        (j, d, b)
        for j, d, b in active_postings
        if j.get("country") == "US" and j.get("track") in ("quant", "actuary")
    ][:5]
    ai_swe_list = [
        (j, d, b)
        for j, d, b in active_postings
        if j.get("country") == "US" and j.get("track") in ("data_ai", "software")
    ][:5]

    def append_job_group(header_title, items):
        if not items:
            return
        lines.append(header_title)
        for idx, (job, _, _) in enumerate(items, 1):
            flag = "🇨🇦" if job.get("country") == "CA" else "🇺🇸"
            age_tag = job.get("age_label") or "NEW"
            lines.append(
                f"<b>{idx}. {job.get('company')}</b> {flag} <code>[{age_tag} 전]</code>"
            )
            lines.append(f"   • 직무: {job.get('title')}")
            lines.append(
                f"   • 지역: {job.get('location')} | <a href='{job.get('url')}'><b>[공식 지원]</b></a>"
            )
        lines.append("")

    append_job_group("🇨🇦 <b>[1] 캐나다(Waterloo/Toronto 등) 최신 Co-op · 인턴십</b>", ca_list)
    append_job_group("📈 <b>[2] 미국 Quantitative Finance · 리스크 · 계리 최신 공고</b>", quant_act_list)
    append_job_group("🤖 <b>[3] 미국 AI · Data Science · Software 최신 공고</b>", ai_swe_list)

    lines.append("──────────────────────────────")
    lines.append(f"💡 <i>위 {len(ca_list) + len(quant_act_list) + len(ai_swe_list)}건 외 전체 {len(active_postings)}건의 선별 공고는 대시보드에서 필터링하여 확인하세요!</i>")
    lines.append("📱 👉 <a href='https://dongfal07.github.io/waterloo-math-career-dashboard/'>전체 공고 모바일 대시보드에서 보기</a>")
    msg = "\n".join(lines)
    return send_telegram_message(msg)


def notify_dashboard_link():
    """스마트폰 원터치 접속을 위한 대시보드 전용 링크 발송"""
    time_str = datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S")
    msg = (
        "📱 <b>[Waterloo Math] 24/7 모바일 대시보드 바로가기</b>\n"
        "──────────────────────────────\n"
        "스마트폰에서 아래 파란색 링크를 터치하시면 24시간 언제든 대시보드가 열립니다:\n\n"
        "👉 <a href='https://dongfal07.github.io/waterloo-math-career-dashboard/'><b>워털루 모바일 대시보드 열기 (터치)</b></a>\n\n"
        "──────────────────────────────\n"
        "💡 <b>[스마트폰 홈 화면에 앱으로 설치하기]</b>\n"
        "1. 위 링크를 터치하여 연 후\n"
        "2. 크롬 우측 상단 <b>[ ⋮ ] (점 3개)</b> 터치\n"
        "3. <b>[홈 화면에 추가]</b> 또는 <b>[앱 설치]</b> 선택\n"
        "바탕화면에 전용 앱 아이콘이 생성되어 24시간 원터치로 접속됩니다!\n"
        f"⏰ 발송: <code>{time_str}</code> (KST)"
    )
    return send_telegram_message(msg)


def notify_test_ping():
    """연동 테스트 핑 메시지 발송"""
    time_str = datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S")
    msg = (
        "🔔 <b>[Waterloo Math Career Dashboard] 알림 테스트</b>\n"
        "──────────────────────────────\n"
        f"⏰ 수신 시간: <code>{time_str}</code> (KST)\n"
        "✅ 텔레그램 알림 시스템이 정상 연동되었습니다!\n"
        "• 워털루 대학교 수학과 1학년 맞춤형 실시간 공고 크롤링 연동 완료\n"
        "• 워털루 공식 Co-op 전체 학사 일정(19건) D-Day 브리핑 지원\n\n"
        "📱 👉 <a href='https://dongfal07.github.io/waterloo-math-career-dashboard/'>모바일 대시보드 열기</a>"
    )
    return send_telegram_message(msg)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        cmd = sys.argv[1].lower()
        if cmd == "--dday":
            notify_d_day_alerts()
        elif cmd == "--jobs":
            notify_job_postings()
        elif cmd == "--sync":
            ensure_live_sync()
        elif cmd == "--test":
            notify_test_ping()
        elif cmd in ("--link", "--mobile", "--mobile-link"):
            notify_dashboard_link()
        else:
            print(f"Unknown command: {cmd}. Use --dday, --jobs, --sync, --test, or --link.")
    else:
        notify_test_ping()
