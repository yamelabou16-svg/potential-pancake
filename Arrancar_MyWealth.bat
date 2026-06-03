@echo off
title MyWealth Pro - Servidor Local
echo Iniciando servidor de MyWealth Pro...
echo Para cerrar el servidor, simplemente cierra esta ventana de comandos.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Arrancar_MyWealth.ps1"
pause
