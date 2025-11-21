@echo off
echo ========================================
echo Tests Unitaires - Services uniquement
echo ========================================
echo.
echo Execution des tests des services...
echo.

ng test --include="**/services/**/*.spec.ts" --watch=false --browsers=ChromeHeadless

echo.
echo ========================================
echo Tests termines !
echo ========================================
pause
