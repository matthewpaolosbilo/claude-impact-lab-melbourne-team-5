from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import issue_auth_token, verify_share_password
from database import get_db
from models import User
from schemas import UserCreate, UserLoginRead, UserRead

router = APIRouter(prefix="/api/users", tags=["users"])


def _synthetic_email(name: str) -> str:
    slug = "".join(
        ch.lower() if ch.isascii() and ch.isalnum() else "-" for ch in name.strip()
    ).strip("-")
    slug = "-".join(part for part in slug.split("-") if part)
    return f"{slug or 'guest'}@spacd.shared"


@router.post("", response_model=UserLoginRead)
def create_user(payload: UserCreate, db: Session = Depends(get_db)) -> User:
    verify_share_password(payload.password)
    email = _synthetic_email(payload.name)

    existing = db.query(User).filter(User.email == email).first()
    if existing is not None:
        existing.token = issue_auth_token(existing.id)
        return existing
    user = User(name=payload.name.strip(), email=email, bio=payload.bio)
    db.add(user)
    db.commit()
    db.refresh(user)
    user.token = issue_auth_token(user.id)
    return user


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int, db: Session = Depends(get_db)) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
