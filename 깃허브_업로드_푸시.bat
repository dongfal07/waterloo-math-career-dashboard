@echo off
python "%~dp0scripts\github_push.py"
if %ERRORLEVEL% neq 0 (
    pause
)
