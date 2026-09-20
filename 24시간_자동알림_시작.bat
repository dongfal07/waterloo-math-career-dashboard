@echo off
chcp 65001 > nul
title Waterloo Math 24/7 Telegram Auto Scheduler

echo ======================================================================
echo   Waterloo Math 24시간 실시간 텔레그램 자동 알림 서비스를 시작합니다.
echo ======================================================================
echo.
echo • 매일 오전 09:00 : 코옵 D-Day 및 긴급 일정 브리핑 자동 발송
echo • 매주 월요일 10:00 : 수학과 추천 북미 인턴십 공고 자동 발송
echo.
echo [안내] 이 창을 최소화해 두시면 백그라운드에서 24시간 자동으로 알림을 보냅니다.
echo [종료] 서비스를 중단하시려면 이 창을 닫으시면 됩니다.
echo ======================================================================
echo.

python "%~dp0scripts\auto_scheduler.py"
if %ERRORLEVEL% neq 0 (
    echo.
    echo 실행 중 오류가 발생했습니다.
    pause
)
