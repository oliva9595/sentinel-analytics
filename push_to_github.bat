@echo off
echo ===================================================
echo   PUSH SENTINEL ANALYTICS TO GITHUB (TEAM 1)
echo ===================================================
set /p REPO_URL="Nhap URL Repository GitHub cua Team 1: "
if "%REPO_URL%"=="" goto error

echo.
echo ===================================================
echo   NHAP GITHUB PERSONAL ACCESS TOKEN (PAT)
echo   (De tranh loi 403 Permission Denied tren may co nhieu tai khoan)
echo ===================================================
set /p PAT_TOKEN="Nhap Personal Access Token (neu khong dung, bam Enter): "
echo.

git remote remove origin >nul 2>&1

if "%PAT_TOKEN%"=="" (
    git remote add origin %REPO_URL%
) else (
    :: Cat URL de chen Token vao giua
    set TEMP_URL=%REPO_URL:https://=%
    git remote add origin https://%PAT_TOKEN%@%TEMP_URL%
)

git branch -M main
echo.
echo Dang push code len Github...
git push -u origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ===================================================
    echo   LOI: Push that bai! Vui long kiem tra quyen truy cap
    echo   hoac thu lai bang cach nhap Personal Access Token (PAT).
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo   PUSH THANH CONG!
    echo ===================================================
)
pause
exit

:error
echo.
echo Loi: Ban chua nhap URL Repository!
pause
