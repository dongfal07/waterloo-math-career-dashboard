#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Waterloo Math Career - 24/7 Realtime Telegram Scheduler
24시간 백그라운드 자동 스케줄러 (매일 D-Day 브리핑 & 주간 신규 인턴십 공고 자동 발송)
"""

import os
import sys
import time
from datetime import datetime

# Windows 콘솔 인코딩
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', line_buffering=True)

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
sys.path.append(CURRENT_DIR)

import telegram_notifier

CONFIG_PATH = os.path.join(PROJECT_ROOT, "config", "telegram_config.json")

def notify_scheduler_started():
    """24시간 스케줄러 시작 알림을 텔레그램으로 전송합니다."""
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    msg = (
        "🤖 <b>[Waterloo Math] 24시간 실시간 알림 서비스 가동</b>\n"
        "──────────────────────────────\n"
        f"⏰ 가동 시작: <code>{now_str}</code>\n"
        "✅ <b>24시간 실시간 자동 감시 모드가 활성화되었습니다!</b>\n\n"
        "📌 <b>자동 발송 스케줄 안내:</b>\n"
        "• <b>매일 오전 09:00</b> : 코옵 D-Day 및 긴급 마감일 리마인더\n"
        "• <b>매주 월요일 오전 10:00</b> : 수학과 추천 북미 인턴십 TOP 공고\n"
        "• <b>마감 임박(D-3, D-1, 당일)</b> : 실시간 긴급 집중 알림\n\n"
        "💡 <i>설정 변경은 config/telegram_config.json 에서 언제든 가능합니다.</i>"
    )
    return telegram_notifier.send_telegram_message(msg)

def run_scheduler():
    config = telegram_notifier.load_json(CONFIG_PATH)
    scheduler_cfg = config.get("scheduler", {})
    daily_time = scheduler_cfg.get("daily_briefing_time", "09:00")
    weekly_day = scheduler_cfg.get("weekly_jobs_day", "Monday")
    weekly_time = scheduler_cfg.get("weekly_jobs_time", "10:00")
    check_interval = scheduler_cfg.get("check_interval_seconds", 60)

    print("\n" + "=" * 70, flush=True)
    print("🚀 [Waterloo Math] 24시간 실시간 텔레그램 자동 알림 엔진 가동!", flush=True)
    print("=" * 70, flush=True)
    print(f"⏰ 매일 D-Day 브리핑 시간  : {daily_time}", flush=True)
    print(f"💼 주간 인턴십 공고 시간  : 매주 {weekly_day} {weekly_time}", flush=True)
    print("💡 종료하려면 키보드에서 [Ctrl + C]를 누르세요.", flush=True)
    print("=" * 70 + "\n", flush=True)

    # 시작 알림 발송
    notify_scheduler_started()

    last_daily_sent_date = None
    last_weekly_sent_week = None

    while True:
        try:
            now = datetime.now()
            today_str = now.strftime("%Y-%m-%d")
            current_hhmm = now.strftime("%H:%M")
            current_day_name = now.strftime("%A")
            current_week = now.strftime("%Y-%W")

            # 1. 매일 오전 정해진 시간 (09:00) D-Day 알림 발송
            if current_hhmm == daily_time and last_daily_sent_date != today_str:
                print(f"[{now.strftime('%H:%M:%S')}] 📢 매일 D-Day 브리핑 자동 발송 실행", flush=True)
                telegram_notifier.notify_d_day_alerts()
                last_daily_sent_date = today_str

            # 2. 매주 월요일 오전 정해진 시간 (10:00) 신규 인턴십 공고 발송
            if current_day_name == weekly_day and current_hhmm == weekly_time and last_weekly_sent_week != current_week:
                print(f"[{now.strftime('%H:%M:%S')}] 📢 주간 인턴십 추천 공고 자동 발송 실행", flush=True)
                telegram_notifier.notify_job_postings()
                last_weekly_sent_week = current_week

            # 주기적으로 휴식
            time.sleep(check_interval)

        except KeyboardInterrupt:
            print("\n🛑 24시간 스케줄러를 종료합니다.", flush=True)
            break
        except Exception as e:
            print(f"⚠️ [스케줄러 예외 발생 - 재시도 대기]: {e}", flush=True)
            time.sleep(30)

if __name__ == "__main__":
    run_scheduler()
