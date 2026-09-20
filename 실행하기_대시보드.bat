@echo off
chcp 65001 > nul
title Waterloo Math Career Dashboard Launcher

echo ======================================================================
echo   Waterloo Math Career Intelligence Dashboard를 실행합니다...
echo ======================================================================
echo.

where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Python 실행 환경이 감지되었습니다.
    python "%~dp0scripts\run_server.py"
    goto end
)

where py >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Python Launcher(py)가 감지되었습니다.
    py "%~dp0scripts\run_server.py"
    goto end
)

echo [경고] 시스템에서 python 명령어를 찾을 수 없습니다.
echo 브라우저 오프라인 모드로 직접 대시보드를 엽니다...
start "" "%~dp0web\desktop_dashboard.html"

:end
if %ERRORLEVEL% neq 0 (
    echo.
    echo 실행 중 오류가 발생했습니다. 위 메시지를 확인해 주세요.
    pause
)
