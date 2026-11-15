#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Waterloo Math Career Dashboard - Local Server & API Bridge (Auto Browser Launch, Live Sync & Port Fallback)
"""

import os
import sys
import json
import socket
import threading
import webbrowser
import time
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", line_buffering=True)

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
WEB_DIR = os.path.join(PROJECT_ROOT, "web")
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
CONFIG_DIR = os.path.join(PROJECT_ROOT, "config")

sys.path.append(CURRENT_DIR)
import telegram_notifier
import live_crawler


def get_local_ip():
    """스마트폰에서 접속할 수 있는 로컬 네트워크 IP를 조회합니다."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


class DashboardRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PROJECT_ROOT, **kwargs)

    def log_message(self, format, *args):
        sys.stdout.write(f"[{time.strftime('%H:%M:%S')}] {args[0]} {args[1]}\n")
        sys.stdout.flush()

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/" or path == "/index.html":
            query_suffix = f"?{parsed.query}" if parsed.query else ""
            if "view=mobile" not in (parsed.query or ""):
                self.send_response(302)
                self.send_header("Location", f"/web/desktop_dashboard.html{query_suffix}")
                self.end_headers()
                return

        if path == "/api/profile":
            self.send_json_response(telegram_notifier.load_json(os.path.join(DATA_DIR, "waterloo_math_profile.json")))
            return

        if path == "/api/postings":
            self.send_json_response(telegram_notifier.load_json(os.path.join(DATA_DIR, "internship_postings.json")))
            return

        if path == "/api/resources":
            self.send_json_response(telegram_notifier.load_json(os.path.join(DATA_DIR, "career_resources.json")))
            return

        if path == "/api/telegram-status":
            local_cfg = os.path.join(CONFIG_DIR, "telegram_config.local.json")
            cfg_path = local_cfg if os.path.exists(local_cfg) else os.path.join(CONFIG_DIR, "telegram_config.json")
            cfg = telegram_notifier.load_json(cfg_path)
            tg = cfg.get("telegram", {})
            tok = str(tg.get("bot_token", "")).strip()
            cid = str(tg.get("chat_id", "")).strip()
            status = {
                "enabled": bool(tg.get("enabled", False)),
                "is_configured": bool(
                    tok
                    and not tok.startswith("YOUR_TELEGRAM_")
                    and cid
                    and not cid.startswith("YOUR_TELEGRAM_")
                ),
            }
            self.send_json_response(status)
            return

        if path == "/api/server-info":
            local_ip = get_local_ip()
            port = self.server.server_port
            info = {
                "local_ip": local_ip,
                "port": port,
                "mobile_url": f"http://{local_ip}:{port}/web/mobile_dashboard.html",
                "desktop_url": f"http://localhost:{port}/web/desktop_dashboard.html",
            }
            self.send_json_response(info)
            return

        if path == "/api/sync":
            try:
                res = live_crawler.sync_all_data()
                self.send_json_response(res)
            except Exception as e:
                self.send_json_response({"success": False, "error": str(e)}, status_code=500)
            return

        if path == "/api/notify":
            query = parse_qs(parsed.query)
            alert_type = query.get("type", ["test"])[0]
            if alert_type == "dday":
                res = telegram_notifier.notify_d_day_alerts()
            elif alert_type == "jobs":
                res = telegram_notifier.notify_job_postings()
            else:
                res = telegram_notifier.notify_test_ping()
            self.send_json_response(res)
            return

        if path == "/api/kakao-config":
            local_cfg = os.path.join(CONFIG_DIR, "telegram_config.local.json")
            cfg_path = local_cfg if os.path.exists(local_cfg) else os.path.join(CONFIG_DIR, "telegram_config.json")
            cfg = telegram_notifier.load_json(cfg_path)
            kakao_cfg = cfg.get("kakao", {})
            self.send_json_response({"javascript_key": kakao_cfg.get("javascript_key", "")})
            return

        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/sync":
            try:
                res = live_crawler.sync_all_data()
                self.send_json_response(res)
            except Exception as e:
                self.send_json_response({"success": False, "error": str(e)}, status_code=500)
            return

        if path == "/api/kakao-config":
            length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            try:
                body = json.loads(raw_body)
                js_key = str(body.get("javascript_key", "")).strip()
                for fname in ("telegram_config.json", "telegram_config.local.json"):
                    fpath = os.path.join(CONFIG_DIR, fname)
                    if fname == "telegram_config.json" or os.path.exists(fpath):
                        cfg = telegram_notifier.load_json(fpath)
                        if "kakao" not in cfg or not isinstance(cfg["kakao"], dict):
                            cfg["kakao"] = {}
                        cfg["kakao"]["javascript_key"] = js_key
                        with open(fpath, "w", encoding="utf-8") as f:
                            json.dump(cfg, f, ensure_ascii=False, indent=2)
                self.send_json_response({"success": True, "javascript_key": js_key})
            except Exception as e:
                self.send_json_response({"success": False, "error": str(e)}, status_code=400)
            return

        self.send_json_response({"error": "Not found"}, status_code=404)

    def send_json_response(self, data, status_code=200):
        content = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)


def open_browser_delayed(url):
    time.sleep(1.0)
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"브라우저 자동 실행 안내: {e}", flush=True)


def find_available_server(start_port=8080, max_attempts=10):
    for port in range(start_port, start_port + max_attempts):
        try:
            server = ThreadingHTTPServer(("", port), DashboardRequestHandler)
            server.daemon_threads = True
            return server, port
        except OSError:
            continue
    raise RuntimeError(f"포트 {start_port}~{start_port + max_attempts - 1} 가 모두 사용 중입니다.")


def run_server(open_browser=True):
    server, port = find_available_server(8080)
    local_ip = get_local_ip()
    desktop_url = f"http://localhost:{port}/web/desktop_dashboard.html"
    mobile_url = f"http://{local_ip}:{port}/web/mobile_dashboard.html"

    print("\n" + "=" * 70, flush=True)
    print("🚀 [Waterloo Math 2028 Career Dashboard] 로컬 통합 서버 가동 성공!", flush=True)
    print("=" * 70, flush=True)
    print(f"💻 데스크톱(노트북) 주소 : {desktop_url}", flush=True)
    print(f"📱 스마트폰(모바일) 주소 : {mobile_url}", flush=True)
    print("─" * 70, flush=True)
    if open_browser:
        print("💡 브라우저가 잠시 후 자동으로 열립니다.", flush=True)
    print("💡 휴대폰으로 보시려면 같은 와이파이에서 위 [스마트폰 주소]를 입력하세요.", flush=True)
    print("💡 종료하려면 키보드에서 [Ctrl + C] 를 누르세요.", flush=True)
    print("=" * 70 + "\n", flush=True)

    if open_browser:
        threading.Thread(target=open_browser_delayed, args=(desktop_url,), daemon=True).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 서버를 종료합니다.", flush=True)
        server.server_close()


if __name__ == "__main__":
    run_server(open_browser="--no-browser" not in sys.argv)
