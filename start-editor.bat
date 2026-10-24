@echo off
rem Start the dot-board editor on this PC: Django API on :8000, Next.js on :3000.
rem Each server opens in its own window. Close the two windows to stop them.
setlocal
set "ROOT=%~dp0"
rem one second between tries: Windows' ping, not a "timeout" that Git or MSYS puts on the PATH
set "PING=%SystemRoot%\System32\PING.EXE"

start "Editor API (port 8000)" /D "%ROOT%src\backend" cmd /k "venv\Scripts\python manage.py migrate --noinput >nul && venv\Scripts\python manage.py createcachetable && venv\Scripts\python manage.py runserver 127.0.0.1:8000"
start "Editor web (port 3000)" /D "%ROOT%src\frontend" cmd /k "npx next dev -p 3000"

echo Waiting for the editor to start (up to 2 minutes)...
for /l %%i in (1,1,120) do (
  curl -s -o nul --max-time 5 http://localhost:3000/ && goto ready
  "%PING%" -n 2 127.0.0.1 >nul
)
echo The editor did not answer. Look at the two server windows for errors.
pause
exit /b 1

:ready
start "" http://localhost:3000
