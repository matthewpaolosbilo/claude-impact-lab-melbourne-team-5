import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers Dev 1 owns
from routers import users
# from routers import events  # TODO Dev 1 Phase D — uncomment when events router lands
# Routers other devs own — leave commented; uncomment when their PR merges.
# from routers import locations  # TODO Dev 2 (feature/gis)
# from routers import badges     # TODO Dev 4 (feature/social)

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:8000"
    ).split(",")
    if origin.strip()
]

app = FastAPI(title="Community Maxxing API", version="0.1.0")

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
# app.include_router(events.router)
# app.include_router(locations.router)   # Dev 2
# app.include_router(badges.router)      # Dev 4
