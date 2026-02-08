@echo off
setlocal enabledelayedexpansion

REM === RUTAS IMPORTANTES ===
set BAT_PATH=%~f0
set DESKTOP=%USERPROFILE%\Desktop
set SHORTCUT_NAME=Combat Cards.lnk
set SHORTCUT_PATH=%DESKTOP%\%SHORTCUT_NAME%
set ICON_PATH=%~dp0Game\icono.ico

echo Iniciando Combat Cards...

REM === 1. EJECUTAR SERVIDOR ===
echo Ejecutando servidor...
start "" "%~dp0server\server.exe"

REM === 2. EJECUTAR CLIENTE ===
echo Ejecutando cliente del juego...
start "" "%~dp0Game\combat_cards.exe"

REM === 3. REVISAR ACCESO DIRECTO ===
if exist "%SHORTCUT_PATH%" (
    echo El acceso directo ya existe en el escritorio.
) else (
    echo Creando acceso directo en el escritorio...

    powershell -command ^
    "$s=(New-Object -COM WScript.Shell).CreateShortcut('%SHORTCUT_PATH%');" ^
    "$s.TargetPath='%BAT_PATH%';" ^
    "$s.IconLocation='%ICON_PATH%';" ^
    "$s.Save()"

    echo Acceso directo creado correctamente.
)

echo Todo listo.
exit
