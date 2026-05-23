"""Badge endpoints — Dev 4.

GET /api/users/{user_id}/badges
GET /api/users/{user_id}/profile-stats   (small extension to power ProfilePanel)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from badge_logic import compute_badges, count_attended, count_hosted
from database import get_db
from models import User


router = APIRouter(prefix="/api", tags=["badges"])


@router.get("/users/{user_id}/badges")
def get_user_badges(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return compute_badges(db, user_id)


@router.get("/users/{user_id}/profile-stats")
def get_profile_stats(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "attended_total": count_attended(db, user_id),
        "hosted_total": count_hosted(db, user_id),
        "attended_by_type": {
            "bbq": count_attended(db, user_id, location_type="bbq"),
            "garden_bed": count_attended(db, user_id, location_type="garden_bed"),
            "community_kitchen": count_attended(db, user_id, location_type="community_kitchen"),
        },
    }
