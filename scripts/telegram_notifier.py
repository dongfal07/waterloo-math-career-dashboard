#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Waterloo Math Career - Telegram Notification Module
워털루 대학교 수학과 1학년 학생 맞춤형 인턴십 및 코옵 알림 봇 엔진
"""

import os
import sys
import json
import urllib.request
import urllib.parse
from datetime import datetime

# Windows 콘솔 유니코드 이모지 인코딩 에러 방지
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
CONFIG_PATH = os.path.join(PROJECT_ROOT, "config", "telegram_config.json")
LOCAL_CONFIG_PATH = os.path.join(PROJECT_ROOT, "config", "telegram_config.local.json")
PROFILE_PATH = os.path.join(PROJECT_ROOT, "data", "waterloo_math_profile.json")
POSTINGS_PATH = os.path.join(PROJECT_ROOT, "data", "internship_postings.json")

def load_json(filepath):
    if not os.path.exists(filepath):
        return {}
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def send_telegram_message(message_text, parse_mode="HTML"):
    """
    텔레그램 봇 API를 호출하여 메시지를 전송합니다.
    토큰이 설정되지 않았거나 유효하지 않은 경우 안전하게 Dry-run(시뮬레이션)으로 처리합니다.
    """
    cfg_file = LOCAL_CONFIG_PATH if os.path.exists(LOCAL_CONFIG_PATH) else CONFIG_PATH
    config = load_json(cfg_file)
    tg_config = config.get("telegram", {})
    # 환경 변수(GitHub Actions Secrets) 우선, 없으면 config 파일 사용
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN") or tg_config.get("bot_token", "")
    chat_id = str(os.environ.get("TELEGRAM_CHAT_ID") or tg_config.get("chat_id", ""))
    enabled = True if os.environ.get("TELEGRAM_BOT_TOKEN") else tg_config.get("enabled", False)

    # Dry-run 모드 체크
    if not enabled or not bot_token or bot_token == "YOUR_TELEGRAM_BOT_TOKEN" or not chat_id or chat_id == "YOUR_TELEGRAM_CHAT_ID":
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print("\n" + "=" * 60)
        print(f"🔔 [TELEGRAM SIMULATION / DRY-RUN] - {timestamp}")
        print("ℹ️  안내: 실제 발송을 원하시면 config/telegram_config.json 에 토큰을 입력하세요.")
        print("-" * 60)
        print(message_text)
        print("=" * 60 + "\n")
        return {
            "success": True,
            "mode": "dry-run",
            "message": "Dry-run 시뮬레이션으로 콘솔에 메시지가 출력되었습니다. (토큰 미설정 상태)"
        }

    # 실제 텔레그램 발송
    api_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message_text,
        "parse_mode": parse_mode,
        "disable_web_page_preview": True
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        api_url,
        data=data,
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            if result.get("ok"):
                print("✅ [TELEGRAM SUCCESS] 텔레그램 메시지가 사용자님 휴대폰으로 성공적으로 발송되었습니다!")
                return {"success": True, "mode": "real", "message": "텔레그램 메시지가 성공적으로 발송되었습니다."}
            else:
                desc = result.get("description")
                print(f"❌ [TELEGRAM ERROR] {desc}")
                return {"success": False, "mode": "real", "error": desc}
    except Exception as e:
        print(f"❌ [TELEGRAM EXCEPTION] {e}")
        return {"success": False, "mode": "real", "error": str(e)}

def notify_d_day_alerts():
    """WaterlooWorks 및 주요 마감일 D-Day 알림 메시지 생성 및 발송"""
    profile = load_json(PROFILE_PATH)
    d_days = profile.get("d_day_alerts", [])
    
    lines = [
        "🎓 <b>[Waterloo Math] 코옵 & 취업 주요 마감일 알림</b>",
        "──────────────────────────────",
        "워털루 수학과 1학년 학생을 위한 필수 일정 안내입니다:\n"
    ]
    for alert in d_days:
        urgency_icon = "🔴" if alert.get("urgency") == "high" else "🟡"
        lines.append(f"{urgency_icon} <b>{alert.get('title')}</b>")
        lines.append(f"   • 마감일: <code>{alert.get('due_date')}</code> (<b>{alert.get('badge')}</b>)")
        lines.append("")
    
    lines.append("──────────────────────────────")
    lines.append("💡 <i>WaterlooWorks 및 이력서 검토 일정을 미리 준수하세요!</i>")
    msg = "\n".join(lines)
    return send_telegram_message(msg)

def notify_job_postings(limit=3):
    """신규 및 추천 북미 인턴십 공고 요약 발송"""
    postings = load_json(POSTINGS_PATH)
    lines = [
        "💼 <b>[Waterloo Math] 맞춤형 북미 인턴십 추천 TOP 3</b>",
        "──────────────────────────────",
        "수학과 1학년 지원 가능 최신 인턴십/코옵 포지션:\n"
    ]
    
    for idx, job in enumerate(postings[:limit], 1):
        flag = "🇨🇦" if job.get("country") == "CA" else "🇺🇸"
        lines.append(f"<b>{idx}. {job.get('company')}</b> {flag}")
        lines.append(f"   📌 직무: <b>{job.get('title')}</b>")
        lines.append(f"   📍 위치: {job.get('location')}")
        lines.append(f"   💰 급여: <code>{job.get('hourly_rate')}</code>")
        lines.append(f"   🛡️ 비자: {job.get('visa_sponsorship')}")
        lines.append(f"   🔗 <a href='{job.get('url')}'>지원 링크 바로가기</a>")
        lines.append("")
        
    lines.append("──────────────────────────────")
    lines.append("📱 <i>자세한 전체 공고는 모바일/PC 대시보드에서 확인 가능합니다.</i>")
    msg = "\n".join(lines)
    return send_telegram_message(msg)

def notify_test_ping():
    """연동 테스트 핑 메시지 발송"""
    time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    msg = (
        "🔔 <b>[Waterloo Math Career Dashboard] 알림 테스트</b>\n"
        "──────────────────────────────\n"
        f"⏰ 수신 시간: <code>{time_str}</code>\n"
        "✅ 텔레그램 알림 시스템이 정상 연동되었습니다!\n"
        "• 워털루 대학교 수학과 1학년 맞춤형 공고 알림 수신 준비 완료\n"
        "• D-Day 리마인더 및 주요 코옵 라운드 마감 실시간 통보 지원"
    )
    return send_telegram_message(msg)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cmd = sys.argv[1].lower()
        if cmd == "--dday":
            notify_d_day_alerts()
        elif cmd == "--jobs":
            notify_job_postings()
        elif cmd == "--test":
            notify_test_ping()
        else:
            print(f"Unknown command: {cmd}. Use --dday, --jobs, or --test.")
    else:
        # 기본 실행: 테스트 핑 실행
        notify_test_ping()
