#!/usr/bin/env python3
"""
Password Reset Utility for Student Management System
Usage: python reset_password.py <username_or_email> <new_password>
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import sessionmaker
from app.database import engine
from app.models import User
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def reset_user_password(username_or_email: str, new_password: str):
    """Reset password for a user by username or email"""
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Find user by username or email
        user = db.query(User).filter(
            (User.username == username_or_email) | (User.email == username_or_email)
        ).first()
        
        if not user:
            print(f"❌ User not found: {username_or_email}")
            return False
        
        # Hash new password
        hashed_password = hash_password(new_password)
        
        # Update password
        user.hashed_password = hashed_password
        db.commit()
        
        print(f"✅ Password reset successful for user: {user.username} ({user.email})")
        print(f"📧 Role: {user.role}")
        return True
        
    except Exception as e:
        print(f"❌ Error resetting password: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def list_users():
    """List all users in the system"""
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        users = db.query(User).all()
        print("\n👥 Available Users:")
        print("-" * 50)
        for user in users:
            status = "🟢 Active" if user.is_active else "🔴 Inactive"
            print(f"ID: {user.id} | Username: {user.username} | Email: {user.email} | Role: {user.role} | {status}")
        print("-" * 50)
    except Exception as e:
        print(f"❌ Error listing users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("🔐 Student Management System - Password Reset Utility")
    print("=" * 60)
    
    if len(sys.argv) == 1:
        print("\n📋 Usage Options:")
        print("  python reset_password.py list                    # List all users")
        print("  python reset_password.py <username> <password>   # Reset password")
        print("  python reset_password.py admin newpassword123    # Example")
        
    elif len(sys.argv) == 2 and sys.argv[1] == "list":
        list_users()
        
    elif len(sys.argv) == 3:
        username_or_email = sys.argv[1]
        new_password = sys.argv[2]
        
        if len(new_password) < 6:
            print("❌ Password must be at least 6 characters long")
            sys.exit(1)
        
        print(f"\n🔄 Resetting password for: {username_or_email}")
        success = reset_user_password(username_or_email, new_password)
        
        if success:
            print(f"✅ You can now login with:")
            print(f"   Username/Email: {username_or_email}")
            print(f"   New Password: {new_password}")
        
    else:
        print("❌ Invalid arguments. Use 'python reset_password.py' for help.")
