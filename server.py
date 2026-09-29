#!/usr/bin/env python3
"""Seera local server.

Serves the Seera page on http://localhost:8765 and runs each analysis through the
locally installed Claude Code CLI (`claude -p`), so no API key is needed.
"""
import base64
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST, PORT = "127.0.0.1", 8765
ROOT = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(ROOT, "cv-xray.html")
LOGO = os.path.join(ROOT, "seera-logo.svg")
TIMEOUT = 300  # seconds per analysis request

SYSTEM = "You are an expert recruiter. Follow the user's instructions exactly and reply with JSON only."


def find_claude():
    path = shutil.which("claude")
    if path:
        return path
    fallback = os.path.expanduser("~/.local/bin/claude")
    return fallback if os.path.exists(fallback) else None


def extract_json(text):
    """Parse the reply leniently: whole text, a fenced block, or the outermost {...}."""
    text = (text or "").strip()
    try:
        return json.loads(text)
    except ValueError:
        pass
    m = re.search(r"```(?:json)?\s*(.*?)```", text, re.S)
    if m:
        try:
            return json.loads(m.group(1))
        except ValueError:
            pass
    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end > start:
        try:
            return json.loads(text[start:end + 1])
        except ValueError:
            pass
    return None


def run_claude(prompt, images):
    claude = find_claude()
    if not claude:
        return {"error": "not_installed"}
    args = [claude, "-p", "--output-format", "json", "--no-session-persistence",
            "--strict-mcp-config", "--disable-slash-commands", "--setting-sources", "",
            "--system-prompt", SYSTEM]
    tmp = None
    try:
        if images:
            # Scanned CVs: save the page images and let Claude read them with the Read tool only.
            tmp = tempfile.mkdtemp(prefix="seera-")
            paths = []
            for i, img in enumerate(images[:5]):
                ext = {"image/jpeg": ".jpg", "image/webp": ".webp", "image/gif": ".gif"}.get(img.get("type"), ".png")
                p = os.path.join(tmp, f"page-{i + 1}{ext}")
                with open(p, "wb") as f:
                    f.write(base64.b64decode(img["data"]))
                paths.append(p)
            prompt += "\n\nThe CV pages are saved as images at these paths. Read each one with the Read tool before answering:\n" + "\n".join(paths)
            args += ["--tools", "Read", "--allowedTools", "Read", "--add-dir", tmp]
        else:
            args += ["--tools", ""]
        proc = subprocess.run(args, input=prompt, capture_output=True, text=True, timeout=TIMEOUT, cwd=tmp or tempfile.gettempdir())
    except subprocess.TimeoutExpired:
        return {"error": "upstream_error"}
    finally:
        if tmp:
            shutil.rmtree(tmp, ignore_errors=True)

    try:
        out = json.loads(proc.stdout)
    except ValueError:
        err = (proc.stderr or proc.stdout or "").lower()
        if "login" in err or "auth" in err:
            return {"error": "session_expired"}
        return {"error": "upstream_error", "detail": (proc.stderr or proc.stdout)[-400:]}
    result = out.get("result", "")
    if out.get("is_error"):
        low = str(result).lower()
        if "limit" in low:
            return {"error": "rate_limited"}
        if "login" in low or "auth" in low:
            return {"error": "session_expired"}
        return {"error": "upstream_error", "detail": str(result)[-400:]}
    data = extract_json(result)
    if data is None:
        return {"error": "invalid_json"}
    return {"data": data}


def wrap_page(body):
    """The page is written as an artifact body; give it the same document shell claude.ai adds."""
    return ("<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n"
            "<style>html{color-scheme:light}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n"
            "</head>\n<body>\n" + body + "\n</body>\n</html>\n")


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write("[seera] " + fmt % args + "\n")

    def send(self, code, body, ctype):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = self.path.split("?")[0]
        if path in ("/", "/index.html"):
            with open(PAGE, "r", encoding="utf-8") as f:
                self.send(200, wrap_page(f.read()).encode("utf-8"), "text/html; charset=utf-8")
        elif path in ("/logo.svg", "/favicon.ico"):
            with open(LOGO, "rb") as f:
                self.send(200, f.read(), "image/svg+xml")
        elif path == "/health":
            self.send(200, b'{"ok":true}', "application/json")
        else:
            self.send(404, b"Not found", "text/plain")

    def do_POST(self):
        if self.path != "/api/sample":
            return self.send(404, b"Not found", "text/plain")
        try:
            length = int(self.headers.get("Content-Length", 0))
            req = json.loads(self.rfile.read(length) or b"{}")
            prompt = str(req.get("prompt", ""))
            if not prompt:
                raise ValueError("empty prompt")
        except (ValueError, TypeError):
            return self.send(400, b'{"error":"invalid_request"}', "application/json")
        res = run_claude(prompt, req.get("images") or [])
        try:
            self.send(200, json.dumps(res).encode(), "application/json")
        except (BrokenPipeError, ConnectionResetError):
            pass  # the page stopped waiting (Stop button or new CV)


if __name__ == "__main__":
    if not find_claude():
        print("Claude Code was not found. Install it and sign in, then start Seera again.", file=sys.stderr)
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Seera is running at http://localhost:{PORT}")
    server.serve_forever()
