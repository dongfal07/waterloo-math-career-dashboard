@echo off
chcp 65001 > nul
echo ======================================================================
echo   스마트폰(아이폰/안드로이드) 접속을 위해 윈도우 방화벽을 허용합니다...
echo ======================================================================
echo.
echo [안내] 잠시 후 나타나는 사용자 계정 컨트롤(UAC) 창에서 "예"를 눌러주세요.
echo.

powershell -Command "Start-Process cmd -ArgumentList '/c netsh advfirewall firewall add rule name=\"Waterloo_Math_Dashboard_8080\" dir=in action=allow protocol=TCP localport=8080 profile=any && echo 방화벽 허용 완료! && timeout /t 3' -Verb RunAs"

echo 조치가 완료되었습니다. 이제 스마트폰에서 QR 코드를 다시 스캔해 보세요!
pause
