@echo off
title Sonara Deepfake Audio AI Launcher
color 0A

echo ======================================================================
echo                  SONARA - ACOUSTIC FORENSICS AI
echo              Localhost Full-Stack Deep Learning Engine
echo ======================================================================
echo.

echo [1/3] Starting Python Deep Learning Backend (FastAPI on Port 8000)...
start "Sonara AI Backend (Port 8000)" cmd /k "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/3] Starting React Forensic Interface (Vite on Port 5173)...
start "Sonara Frontend (Port 5173)" cmd /k "npm --prefix frontend run dev"

echo [3/3] Initializing runtime servers...
timeout /t 4 /nobreak >nul

echo.
echo Launching Sonara in your default web browser...
start http://localhost:5173

echo.
echo ======================================================================
echo  Sonara is now active! 
echo  - Frontend: http://localhost:5173
echo  - Backend API: http://localhost:8000/docs
echo.
echo  Keep the backend and frontend terminal windows open while testing.
echo  To shut down, simply close those terminal windows.
echo ======================================================================
echo.
pause
