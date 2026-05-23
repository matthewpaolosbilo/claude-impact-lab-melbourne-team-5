import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import SessionLocal, init_db
from routers import events, users

# Routers other devs own — uncomment when their PR merges.
# from routers import locations  # TODO Dev 2 (feature/gis)
# from routers import badges     # TODO Dev 4 (feature/social)
from seed import seed_if_empty

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:8000"
    ).split(",")
    if origin.strip()
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Community Maxxing API", version="0.1.0", lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


app.include_router(users.router)
app.include_router(events.router)
app.include_router(events.rsvps_router)
app.include_router(events.search_router)
# app.include_router(locations.router)   # Dev 2
# app.include_router(badges.router)      # Dev 4
