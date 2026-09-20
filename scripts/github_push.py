#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Waterloo Math Career - GitHub Uploader & 24/7 Cloud Actions Launcher
"""

import os
import sys
import subprocess
import webbrowser

# Windows 콘솔 인코딩
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', line_buffering=True)

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)

def run_git_push():
    print("\n" + "=" * 70, flush=True)
    print("🚀 [GitHub 클라우드 업로더] 24시간 무중단 텔레그램 알림 시스템 연동", flush=True)
    print("=" * 70, flush=True)
    print("• 대상 계정 : dongfal07 (dongfal07@gmail.com)", flush=True)
    print("• 저장소 주소 : https://github.com/dongfal07/waterloo-math-career-dashboard.git", flush=True)
    print("─" * 70, flush=True)

    print("\n[1/2] GitHub 서버로 코드 업로드(Push)를 시도합니다...", flush=True)

    # git push 실행
    res = subprocess.run(
        ["git", "push", "-u", "origin", "main"],
        cwd=PROJECT_ROOT,
        capture_output=True,
        text=True
    )

    combined_output = (res.stdout or "") + (res.stderr or "")

    # 성공 케이스
    if res.returncode == 0:
        print("\n" + "=" * 70, flush=True)
        print("🎉 [업로드 대성공!] GitHub에 코드가 성공적으로 업로드되었습니다!", flush=True)
        print("=" * 70, flush=True)
        print("✅ 24시간 365일 무중단 GitHub Actions 클라우드 스케줄러가 활성화되었습니다.", flush=True)
        print("✅ 이제 컴퓨터/노트북 전원을 완전히 끄셔도 스마트폰으로 매일 알림이 옵니다.", flush=True)
        print("─" * 70, flush=True)
        print("🔗 저장소 바로가기: https://github.com/dongfal07/waterloo-math-career-dashboard", flush=True)
        print("=" * 70 + "\n", flush=True)
        input("계속하려면 아무 키나 누르세요 . . . ")
        return True

    # 실패 케이스: 저장소 미생성 (Repository not found)
    if "not found" in combined_output.lower():
        print("\n⚠️ [안내] GitHub에 아직 'waterloo-math-career-dashboard' 저장소가 없습니다!", flush=True)
        print("GitHub 웹사이트에서 저장소를 먼저 만들어 주셔야 코드가 업로드됩니다.\n", flush=True)
        print("💡 저장소 생성을 위해 웹 브라우저를 지금 자동으로 엽니다...", flush=True)
        
        webbrowser.open("https://github.com/new")
        
        print("\n" + "─" * 70, flush=True)
        print("📋 [GitHub 웹 화면에서 딱 3가지만 입력해 주세요]:", flush=True)
        print("1. Repository name 에 아래 이름 입력:")
        print("   👉  waterloo-math-career-dashboard")
        print("2. 공개 범위: [Private] (비공개) 선택")
        print("3. 맨 아래 초록색 [Create repository] 버튼 클릭")
        print("─" * 70 + "\n", flush=True)
        
        input("👉 저장을 완료하셨으면 키보드의 [Enter]를 누르세요. 바로 업로드를 재시도합니다: ")
        
        # 재시도
        print("\n[2/2] GitHub 업로드를 다시 시도합니다...", flush=True)
        retry_res = subprocess.run(
            ["git", "push", "-u", "origin", "main"],
            cwd=PROJECT_ROOT
        )
        if retry_res.returncode == 0:
            print("\n🎉 [성공] GitHub에 코드가 성공적으로 업로드되었습니다!", flush=True)
            print("24시간 클라우드 자동 알림이 활성화되었습니다.\n", flush=True)
        else:
            print("\n⚠️ 업로드 중 오류가 발생했습니다. 메시지를 확인해 주세요.\n", flush=True)
            
        input("계속하려면 아무 키나 누르세요 . . . ")
        return

    # 기타 인증 또는 오류
    print("\n⚠️ [Git 출력 결과]:\n", combined_output, flush=True)
    input("계속하려면 아무 키나 누르세요 . . . ")

if __name__ == "__main__":
    run_git_push()
