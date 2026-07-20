@echo off
cd /d "%~dp0"
echo Opening Mahmoud Salama Career Intelligence on http://localhost:8080
start "" http://localhost:8080/index.html
python -m http.server 8080
pause
