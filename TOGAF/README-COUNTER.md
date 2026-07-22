# TOGAF HTML + Python CGI Visitor Counter

The public platform and admin dashboard are HTML files. The only server-side file is:

`cgi-bin/togaf_analytics.py`

All analytics data is stored in JSON text files under `data/`. No database and no PHP are used.

## Requirements
- Python 3.8 or newer
- CGI support enabled by the web host
- Write permission for `TOGAF/data/`
- HTTPS strongly recommended

## Upload
1. Upload the complete `TOGAF` folder.
2. Make `cgi-bin/togaf_analytics.py` executable (`755`).
3. Make the `data` directory writable by the CGI user, commonly `775`.
4. Make the JSON files writable, commonly `664`.
5. Open `index.html` through the website.
6. Open `admin.html` for the analytics dashboard.
7. Sign in with the separately supplied credentials and change them immediately.

## Local test
From the directory that contains the `TOGAF` folder:

```bash
python3 -m http.server --cgi 8000 --directory TOGAF
```

Then open:
- Site: `http://localhost:8000/index.html`
- Admin: `http://localhost:8000/admin.html`

## Hosting compatibility
This works on hosting that supports Python CGI. It does not work on static-only hosting such as GitHub Pages.

## Text files
- `data/visits.json`: visits and aggregate statistics
- `data/login-attempts.json`: rate-limit state
- `data/config.json`: username, password hash, and signing secret

## Privacy
- Raw IP addresses are not stored.
- Unique visitors use a random first-party cookie.
- IP addresses are HMAC-hashed only for login rate limiting.
- Known bots are ignored by default.

## Security
- Admin password uses PBKDF2-HMAC-SHA256.
- Authentication uses a signed HttpOnly cookie.
- Credential-changing and logout actions use a CSRF token.
- Login attempts are rate-limited.
- Protect the `data/` directory at server level. Apache `.htaccess` and IIS `web.config` files are included.

## Android local file
`TOGAF-Mobile.html` still works as an offline single file, but global visitor counting requires opening the hosted website through HTTP/HTTPS.


## Nginx protection
Nginx does not read `.htaccess`. Add a rule similar to:

```nginx
location ^~ /TOGAF/data/ {
    deny all;
    return 403;
}
```

Configure the Python script as CGI/FastCGI according to the hosting provider. This package targets traditional Python CGI hosting.

## Permissions troubleshooting
On most shared hosting accounts, `755` for the CGI script, `775` for `data/`, and `664` for JSON files are sufficient. If the CGI process runs as a different operating-system user, the host may require different ownership or permissions. Avoid making the data directory publicly readable through HTTP; the included Apache and IIS rules block it.
