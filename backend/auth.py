from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
from typing import Any, Optional

from fastapi import Header, HTTPException, status


TOKEN_TTL_SECONDS = 60 * 60 * 24 * 14


def get_share_password() -> str:
    password = os.getenv("SPACD_SHARE_PASSWORD", "").strip()
    if not password:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SPACD_SHARE_PASSWORD is not configured",
        )
    return password


def verify_share_password(password: str) -> None:
    if not hmac.compare_digest(password, get_share_password()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid shared password",
        )


def _signing_secret() -> bytes:
    secret = os.getenv("SPACD_AUTH_SECRET") or get_share_password()
    return secret.encode("utf-8")


def _b64encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _b64decode(raw: str) -> bytes:
    padding = "=" * (-len(raw) % 4)
    return base64.urlsafe_b64decode((raw + padding).encode("ascii"))


def issue_auth_token(user_id: int) -> str:
    payload = {
        "sub": str(user_id),
        "iat": int(time.time()),
        "exp": int(time.time()) + TOKEN_TTL_SECONDS,
    }
    payload_b64 = _b64encode(
        json.dumps(payload, separators=(",", ":")).encode("utf-8")
    )
    signature = hmac.new(
        _signing_secret(), payload_b64.encode("ascii"), hashlib.sha256
    ).digest()
    return f"{payload_b64}.{_b64encode(signature)}"


def verify_auth_token(token: str) -> dict[str, Any]:
    try:
        payload_b64, signature_b64 = token.split(".", 1)
        expected = hmac.new(
            _signing_secret(), payload_b64.encode("ascii"), hashlib.sha256
        ).digest()
        actual = _b64decode(signature_b64)
        if not hmac.compare_digest(actual, expected):
            raise ValueError("bad signature")
        payload = json.loads(_b64decode(payload_b64))
        if int(payload.get("exp", 0)) < int(time.time()):
            raise ValueError("expired")
        return payload
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid auth token",
        ) from exc


def require_chat_token(
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
) -> dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer token is required",
        )
    return verify_auth_token(authorization.removeprefix("Bearer ").strip())
