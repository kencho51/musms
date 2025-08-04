#!/usr/bin/env python3
"""
University Student Management System
FastAPI application launcher
"""
import uvicorn
from app.main import app

if __name__ == "__main__":
    print("🎓 Starting University Student Management System...")
    print("📊 Dashboard: http://127.0.0.1:8000/dashboard")
    print("👥 Students: http://127.0.0.1:8000/students") 
    print("🔐 Login: http://127.0.0.1:8000/login")
    print("📝 Register: http://127.0.0.1:8000/register")
    print("📖 API Docs: http://127.0.0.1:8000/docs")
    print("\nPress Ctrl+C to stop the server\n")
    
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    ) 