#!/usr/bin/env python3
from __future__ import annotations

import base64
import csv
import datetime as dt
import hashlib
import hmac
import io
import json
import os
import re
import secrets
import sys
import tempfile
import time
from contextlib import contextmanager
from http import cookies
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'data'
CONFIG_FILE = DATA / 'config.json'
VISITS_FILE = DATA / 'visits.json'
ATTEMPTS_FILE = DATA / 'login-attempts.json'

try:
    import fcntl
except ImportError:  # pragma: no cover - Linux CGI hosts normally provide fcntl
    fcntl = None


def b64e(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('ascii').rstrip('=')


def b64d(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + '=' * (-len(value) % 4))


def utcnow() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def iso_now() -> str:
    return utcnow().isoformat().replace('+00:00', 'Z')


def read_json(path: Path, default):
    try:
        with path.open('r', encoding='utf-8') as fh:
            value = json.load(fh)
            return value if isinstance(value, type(default)) else default
    except Exception:
        return default


@contextmanager
def file_lock(path: Path):
    lock_path = path.with_suffix(path.suffix + '.lock')
    lock_path.parent.mkdir(parents=True, exist_ok=True)
    handle = lock_path.open('a+b')
    try:
        if fcntl is not None:
            fcntl.flock(handle.fileno(), fcntl.LOCK_EX)
        yield
    finally:
        if fcntl is not None:
            fcntl.flock(handle.fileno(), fcntl.LOCK_UN)
        handle.close()


def update_json(path: Path, default, callback):
    with file_lock(path):
        current = read_json(path, default)
        updated = callback(current)
        path.parent.mkdir(parents=True, exist_ok=True)
        fd, temp_name = tempfile.mkstemp(prefix=path.name + '.', suffix='.tmp', dir=str(path.parent))
        try:
            with os.fdopen(fd, 'w', encoding='utf-8') as fh:
                json.dump(updated, fh, ensure_ascii=False, indent=2)
                fh.flush()
                os.fsync(fh.fileno())
            os.replace(temp_name, path)
        finally:
            if os.path.exists(temp_name):
                os.unlink(temp_name)
        return updated


def default_stats():
    return {
        'version': 1,
        'created_at': None,
        'updated_at': None,
        'totals': {'pageviews': 0, 'sessions': 0, 'unique_visitors': 0},
        'days': {}, 'pages': {},
        'devices': {'desktop': 0, 'mobile': 0, 'tablet': 0, 'other': 0},
        'referrers': {}, 'visitors': {}, 'recent': [],
    }


def load_config():
    config = read_json(CONFIG_FILE, {})
    required = {'username', 'password_salt', 'password_hash', 'password_iterations', 'secret'}
    if not required.issubset(config):
        raise RuntimeError('Analytics configuration is incomplete.')
    return config


def parse_cookies():
    jar = cookies.SimpleCookie()
    try:
        jar.load(os.environ.get('HTTP_COOKIE', ''))
    except Exception:
        pass
    return {key: morsel.value for key, morsel in jar.items()}


def base_path():
    script = os.environ.get('SCRIPT_NAME', '/cgi-bin/togaf_analytics.py')
    if '/cgi-bin/' in script:
        prefix = script.split('/cgi-bin/', 1)[0]
        return (prefix.rstrip('/') + '/') or '/'
    return '/'


def is_https():
    return os.environ.get('HTTPS', '').lower() in {'on', '1', 'true'} or os.environ.get('HTTP_X_FORWARDED_PROTO', '').lower() == 'https'


def cookie_header(name, value, max_age, http_only=True, same_site='Lax'):
    parts = [f'{name}={value}', f'Path={base_path()}', f'Max-Age={int(max_age)}', f'SameSite={same_site}']
    if http_only:
        parts.append('HttpOnly')
    if is_https():
        parts.append('Secure')
    return '; '.join(parts)


def response(status='200 OK', content_type='application/json; charset=utf-8', headers=None, body=''):
    print(f'Status: {status}')
    print(f'Content-Type: {content_type}')
    print('X-Content-Type-Options: nosniff')
    print('Referrer-Policy: strict-origin-when-cross-origin')
    print('Cache-Control: no-store, no-cache, must-revalidate, max-age=0')
    if headers:
        for name, value in headers:
            print(f'{name}: {value}')
    print()
    if isinstance(body, bytes):
        sys.stdout.flush()
        sys.stdout.buffer.write(body)
    else:
        print(body, end='')


def json_response(payload, status='200 OK', headers=None):
    response(status, 'application/json; charset=utf-8', headers, json.dumps(payload, ensure_ascii=False, separators=(',', ':')))


def query_params():
    return {k: v[-1] if v else '' for k, v in parse_qs(os.environ.get('QUERY_STRING', ''), keep_blank_values=True).items()}


def read_body():
    try:
        length = int(os.environ.get('CONTENT_LENGTH', '0') or '0')
    except ValueError:
        length = 0
    raw = sys.stdin.buffer.read(max(0, min(length, 128_000))) if length else b''
    content_type = os.environ.get('CONTENT_TYPE', '')
    if 'application/json' in content_type:
        try:
            value = json.loads(raw.decode('utf-8') or '{}')
            return value if isinstance(value, dict) else {}
        except Exception:
            return {}
    try:
        return {k: v[-1] if v else '' for k, v in parse_qs(raw.decode('utf-8'), keep_blank_values=True).items()}
    except Exception:
        return {}


def secure_hash(value, config):
    return hmac.new(config['secret'].encode(), value.encode(), hashlib.sha256).hexdigest()


def is_bot(ua):
    return re.search(r'bot|crawler|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|headless|lighthouse|pagespeed', ua, re.I) is not None


def device_type(ua):
    if re.search(r'ipad|tablet|kindle|silk', ua, re.I):
        return 'tablet'
    if re.search(r'mobile|android|iphone|ipod|opera mini|iemobile', ua, re.I):
        return 'mobile'
    return 'other' if not ua.strip() else 'desktop'


def sanitize_page(page):
    page = page.split('?', 1)[0].split('#', 1)[0].rsplit('/', 1)[-1]
    return page if re.fullmatch(r'[A-Za-z0-9._-]{1,100}', page or '') else 'unknown'


def referrer_domain():
    ref = os.environ.get('HTTP_REFERER', '').strip()
    if not ref:
        return 'Direct'
    host = (urlparse(ref).hostname or '').lower()
    own = os.environ.get('HTTP_HOST', '').split(':', 1)[0].lower()
    if host and host == own:
        return 'Internal'
    return host or 'Other'


def verify_password(password, config):
    try:
        salt = b64d(config['password_salt'])
        expected = b64d(config['password_hash'])
        actual = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, int(config['password_iterations']))
        return hmac.compare_digest(actual, expected)
    except Exception:
        return False


def make_auth_cookie(username, config):
    csrf = secrets.token_urlsafe(24)
    payload = {
        'u': username,
        'exp': int(time.time()) + int(config.get('admin_session_seconds', 3600)),
        'csrf': csrf,
    }
    encoded = b64e(json.dumps(payload, separators=(',', ':')).encode())
    signature = b64e(hmac.new(config['secret'].encode(), encoded.encode(), hashlib.sha256).digest())
    return encoded + '.' + signature, csrf


def verify_auth(config):
    token = parse_cookies().get('togaf_admin', '')
    try:
        encoded, signature = token.split('.', 1)
        expected = b64e(hmac.new(config['secret'].encode(), encoded.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(signature, expected):
            return None
        payload = json.loads(b64d(encoded).decode())
        if int(payload.get('exp', 0)) < int(time.time()):
            return None
        if not hmac.compare_digest(str(payload.get('u', '')), str(config['username'])):
            return None
        return payload
    except Exception:
        return None


def require_auth(config):
    auth = verify_auth(config)
    if not auth:
        json_response({'ok': False, 'error': 'unauthorized'}, '401 Unauthorized')
        raise SystemExit
    return auth


def require_csrf(auth):
    sent = os.environ.get('HTTP_X_CSRF_TOKEN', '')
    if not sent or not hmac.compare_digest(sent, str(auth.get('csrf', ''))):
        json_response({'ok': False, 'error': 'csrf'}, '403 Forbidden')
        raise SystemExit


def client_rate_key(config):
    ip = os.environ.get('REMOTE_ADDR', 'unknown')
    return secure_hash(ip, config)


def login_status(config):
    key = client_rate_key(config)
    attempts = read_json(ATTEMPTS_FILE, {})
    return key, attempts.get(key, {'count': 0, 'window_start': int(time.time()), 'blocked_until': 0})


def record_login(config, success):
    key = client_rate_key(config)
    now = int(time.time())
    def mutate(all_rows):
        if success:
            all_rows.pop(key, None)
            return all_rows
        row = all_rows.get(key, {'count': 0, 'window_start': now, 'blocked_until': 0})
        if now - int(row.get('window_start', 0)) > 900:
            row = {'count': 0, 'window_start': now, 'blocked_until': 0}
        row['count'] = int(row.get('count', 0)) + 1
        if row['count'] >= 5:
            row['blocked_until'] = now + 900
        all_rows[key] = row
        for old_key in list(all_rows):
            if now - int(all_rows[old_key].get('window_start', now)) > 86400:
                all_rows.pop(old_key, None)
        return all_rows
    update_json(ATTEMPTS_FILE, {}, mutate)


def action_visit(config, params):
    ua = os.environ.get('HTTP_USER_AGENT', '')
    if not config.get('count_bots', False) and is_bot(ua):
        response(body='window.TOGAF_ANALYTICS={counted:false,reason:"bot"};', content_type='application/javascript; charset=utf-8')
        return
    now = int(time.time())
    today = dt.datetime.now().strftime('%Y-%m-%d')
    jar = parse_cookies()
    visitor_id = jar.get('togaf_vid', '')
    new_visitor_cookie = not re.fullmatch(r'[A-Za-z0-9_-]{16,100}', visitor_id or '')
    if new_visitor_cookie:
        visitor_id = secrets.token_urlsafe(24)
    visitor_hash = secure_hash(visitor_id, config)
    session_id = jar.get('togaf_sid', '')
    new_session = not re.fullmatch(r'[A-Za-z0-9_-]{16,100}', session_id or '')
    if new_session:
        session_id = secrets.token_urlsafe(20)
    page = sanitize_page(params.get('page', 'unknown'))
    device = device_type(ua)
    referrer = referrer_domain()
    new_unique = False

    def mutate(stats):
        nonlocal new_unique
        if not stats.get('created_at'):
            stats['created_at'] = iso_now()
        totals = stats.setdefault('totals', {'pageviews': 0, 'sessions': 0, 'unique_visitors': 0})
        totals['pageviews'] = int(totals.get('pageviews', 0)) + 1
        if new_session:
            totals['sessions'] = int(totals.get('sessions', 0)) + 1
        visitors = stats.setdefault('visitors', {})
        if visitor_hash not in visitors:
            new_unique = True
            totals['unique_visitors'] = int(totals.get('unique_visitors', 0)) + 1
            visitors[visitor_hash] = {'first_seen': iso_now(), 'last_seen': iso_now(), 'views': 0, 'sessions': 0}
        visitor = visitors[visitor_hash]
        visitor['last_seen'] = iso_now()
        visitor['views'] = int(visitor.get('views', 0)) + 1
        if new_session:
            visitor['sessions'] = int(visitor.get('sessions', 0)) + 1

        days = stats.setdefault('days', {})
        day = days.setdefault(today, {'pageviews': 0, 'sessions': 0, 'unique_visitors': 0, 'unique_ids': {}})
        day['pageviews'] = int(day.get('pageviews', 0)) + 1
        if new_session:
            day['sessions'] = int(day.get('sessions', 0)) + 1
        unique_ids = day.setdefault('unique_ids', {})
        if visitor_hash not in unique_ids:
            unique_ids[visitor_hash] = True
            day['unique_visitors'] = int(day.get('unique_visitors', 0)) + 1

        pages = stats.setdefault('pages', {})
        page_row = pages.setdefault(page, {'pageviews': 0, 'sessions': 0})
        page_row['pageviews'] = int(page_row.get('pageviews', 0)) + 1
        if new_session:
            page_row['sessions'] = int(page_row.get('sessions', 0)) + 1

        devices = stats.setdefault('devices', {})
        devices[device] = int(devices.get(device, 0)) + 1
        refs = stats.setdefault('referrers', {})
        refs[referrer] = int(refs.get(referrer, 0)) + 1

        recent = stats.setdefault('recent', [])
        recent.append({'time': iso_now(), 'page': page, 'visitor': visitor_hash[:10], 'new_session': new_session, 'device': device, 'referrer': referrer})
        max_recent = int(config.get('max_recent_visits', 250))
        if len(recent) > max_recent:
            del recent[:-max_recent]
        cutoff = (dt.datetime.now() - dt.timedelta(days=400)).strftime('%Y-%m-%d')
        for key in list(days):
            if key < cutoff:
                days.pop(key, None)
        stats['updated_at'] = iso_now()
        return stats

    update_json(VISITS_FILE, default_stats(), mutate)
    headers = [
        ('Set-Cookie', cookie_header('togaf_vid', visitor_id, 31536000, True, 'Lax')),
        ('Set-Cookie', cookie_header('togaf_sid', session_id, int(config.get('visitor_session_seconds', 1800)), True, 'Lax')),
    ]
    payload = json.dumps({'counted': True, 'newSession': new_session, 'newVisitor': new_unique}, separators=(',', ':'))
    response(content_type='application/javascript; charset=utf-8', headers=headers, body='window.TOGAF_ANALYTICS=' + payload + ';')


def action_login(config):
    body = read_body()
    key, status = login_status(config)
    now = int(time.time())
    if int(status.get('blocked_until', 0)) > now:
        json_response({'ok': False, 'error': 'blocked', 'retry_after': int(status['blocked_until']) - now}, '429 Too Many Requests')
        return
    username = str(body.get('username', '')).strip()
    password = str(body.get('password', ''))
    valid_user = hmac.compare_digest(username, str(config['username']))
    valid_password = verify_password(password, config)
    if not (valid_user and valid_password):
        record_login(config, False)
        time.sleep(0.35)
        json_response({'ok': False, 'error': 'invalid_credentials'}, '401 Unauthorized')
        return
    record_login(config, True)
    token, csrf = make_auth_cookie(config['username'], config)
    headers = [('Set-Cookie', cookie_header('togaf_admin', token, int(config.get('admin_session_seconds', 3600)), True, 'Strict'))]
    json_response({'ok': True, 'csrf': csrf}, headers=headers)


def public_stats(stats):
    sanitized = json.loads(json.dumps(stats))
    for day in sanitized.get('days', {}).values():
        day.pop('unique_ids', None)
    sanitized.pop('visitors', None)
    return sanitized


def action_stats(config):
    auth = require_auth(config)
    stats = public_stats(read_json(VISITS_FILE, default_stats()))
    json_response({'ok': True, 'csrf': auth['csrf'], 'stats': stats})


def action_change_credentials(config):
    auth = require_auth(config)
    require_csrf(auth)
    body = read_body()
    current_password = str(body.get('current_password', ''))
    new_username = str(body.get('username', '')).strip()
    new_password = str(body.get('new_password', ''))
    if not verify_password(current_password, config):
        json_response({'ok': False, 'error': 'current_password'}, '400 Bad Request')
        return
    if not re.fullmatch(r'[A-Za-z0-9._-]{4,40}', new_username):
        json_response({'ok': False, 'error': 'username_format'}, '400 Bad Request')
        return
    if len(new_password) < 12:
        json_response({'ok': False, 'error': 'password_length'}, '400 Bad Request')
        return
    new_salt = secrets.token_bytes(24)
    new_hash = hashlib.pbkdf2_hmac('sha256', new_password.encode(), new_salt, int(config['password_iterations']))
    config['username'] = new_username
    config['password_salt'] = b64e(new_salt)
    config['password_hash'] = b64e(new_hash)
    config['updated_at'] = iso_now()
    with file_lock(CONFIG_FILE):
        fd, temp_name = tempfile.mkstemp(prefix='config.', suffix='.tmp', dir=str(DATA))
        try:
            with os.fdopen(fd, 'w', encoding='utf-8') as fh:
                json.dump(config, fh, ensure_ascii=False, indent=2)
                fh.flush(); os.fsync(fh.fileno())
            os.replace(temp_name, CONFIG_FILE)
        finally:
            if os.path.exists(temp_name): os.unlink(temp_name)
    token, csrf = make_auth_cookie(new_username, config)
    headers = [('Set-Cookie', cookie_header('togaf_admin', token, int(config.get('admin_session_seconds', 3600)), True, 'Strict'))]
    json_response({'ok': True, 'csrf': csrf}, headers=headers)


def action_logout(config):
    auth = require_auth(config)
    require_csrf(auth)
    headers = [('Set-Cookie', cookie_header('togaf_admin', '', 0, True, 'Strict'))]
    json_response({'ok': True}, headers=headers)


def action_export(config):
    require_auth(config)
    stats = read_json(VISITS_FILE, default_stats())
    output = io.StringIO(newline='')
    writer = csv.writer(output)
    writer.writerow(['section', 'key', 'pageviews', 'sessions', 'unique_visitors'])
    for key, row in sorted(stats.get('days', {}).items()):
        writer.writerow(['day', key, row.get('pageviews', 0), row.get('sessions', 0), row.get('unique_visitors', 0)])
    for key, row in sorted(stats.get('pages', {}).items()):
        writer.writerow(['page', key, row.get('pageviews', 0), row.get('sessions', 0), ''])
    for key, count in sorted(stats.get('devices', {}).items()):
        writer.writerow(['device', key, count, '', ''])
    for key, count in sorted(stats.get('referrers', {}).items()):
        writer.writerow(['referrer', key, count, '', ''])
    filename = 'togaf-analytics-' + dt.datetime.now().strftime('%Y-%m-%d') + '.csv'
    response(content_type='text/csv; charset=utf-8', headers=[('Content-Disposition', f'attachment; filename="{filename}"')], body='\ufeff' + output.getvalue())


def action_reset(config):
    auth = require_auth(config)
    require_csrf(auth)
    update_json(VISITS_FILE, default_stats(), lambda _old: default_stats())
    json_response({'ok': True})


def main():
    try:
        config = load_config()
        params = query_params()
        action = params.get('action', 'visit')
        if action == 'visit': action_visit(config, params)
        elif action == 'login': action_login(config)
        elif action == 'stats': action_stats(config)
        elif action == 'change_credentials': action_change_credentials(config)
        elif action == 'logout': action_logout(config)
        elif action == 'export': action_export(config)
        elif action == 'reset': action_reset(config)
        else: json_response({'ok': False, 'error': 'unknown_action'}, '404 Not Found')
    except SystemExit:
        pass
    except Exception as exc:
        json_response({'ok': False, 'error': 'server_error'}, '500 Internal Server Error')


if __name__ == '__main__':
    main()
