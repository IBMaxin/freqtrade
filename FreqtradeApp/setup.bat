@echo off
echo Installing dependencies...
npm install
echo.
echo Running database migrations...
npm run db:push
echo.
echo Setup complete.
pause