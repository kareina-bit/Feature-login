import uuid
from fastapi import APIRouter, HTTPException, Depends

from schemas.user import UserRegister, UserLogin, TokenResponse
from db.models import users_collection
from core.security import (
    hash_password,
    verify_password,
    create_access_token
)
# Example

router = APIRouter(tags=["Auth"])

@router.post("/register")
def register(payload: UserRegister):
    if users_collection.find_one({"email": payload.email}):
        raise HTTPException(400, "Email already exists")

    user = {
        "user_id": str(uuid.uuid4()),
        "email": payload.email,
        "phone": payload.phone,
        "password_hash": hash_password(payload.password),
        "plan": "free",
        "token": str(uuid.uuid4()),
        "webhook_name": payload.email.split("@")[0].replace(".", "-")
    }

    users_collection.insert_one(user)
    return {"user_id": user["user_id"], "token": user["token"]}


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin):
    user = users_collection.find_one({"email": payload.email})
    if not user:
        raise HTTPException(401, "Invalid credentials")

    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")

    access_token = create_access_token(
        {"sub": user["user_id"]}
    )

    return {"access_token": access_token}
