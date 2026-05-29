@echo off
echo ===================================================
echo   PUSH SENTINEL ANALYTICS TO GITHUB (TEAM 1)
echo ===================================================
set /p REPO_URL="Nhap URL Repository GitHub cua Team 1 (sentinel-analytics): "
if "%REPO_URL%"=="" goto error

git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
git branch -M main
echo.
echo Dang push code len Github...
git push -u origin main
echo.
echo ===================================================
echo   PUSH THANH CONG!
echo ===================================================
pause
exit

:error
echo.
echo Loi: Ban chua nhap URL Repository!
pause
