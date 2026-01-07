# HƯỚNG DẪN VIẾT API BẰNG FASTAPI (PYTHON)

> **Mục tiêu**: Hướng dẫn dev backend viết API bằng FastAPI **bắt buộc có mô tả Swagger đầy đủ**, dễ đọc – dễ test – dễ maintain.

---

## 1. Nguyên tắc bắt buộc (Coding Rule)

Khi viết API FastAPI, **BẮT BUỘC**:

1. ❗ Mỗi API **phải hiển thị rõ ràng trên Swagger**
2. ❗ Có `summary`, `description`
3. ❗ Có request/response model (Pydantic)
4. ❗ Có example request
5. ❗ Không hardcode config (DB, secret)
6. ❗ API phải được group bằng `tags`

> ❌ API không có mô tả Swagger → **KHÔNG ĐƯỢC MERGE**

---

## 2. Cấu trúc project chuẩn

```
app/
├── main.py                 # FastAPI app + Swagger config
├── core/
│   ├── config.py           # ENV
│   └── security.py         # JWT, hash password
├── db/
│   ├── base.py
│   ├── session.py
│   └── models.py
├── schemas/                # Request / Response (Swagger sinh từ đây)
│   └── user.py
├── api/
│   ├── deps.py
│   └── v1/
│       ├── auth.py         # Login / Register
│       └── router.py
└── .env
```

---

## 3. Swagger nằm ở đâu?

| Thành phần   | URL             |
| ------------ | --------------- |
| Swagger UI   | `/docs`         |
| ReDoc        | `/redoc`        |
| OpenAPI JSON | `/openapi.json` |

Swagger **KHÔNG viết file riêng**, mà được sinh từ:

* `main.py`
* decorator API (`@router.post`, `@router.get`…)
* Pydantic schema

---

## 4. Khai báo Swagger tổng (BẮT BUỘC)

📍 **File: `main.py`**

```python
from fastapi import FastAPI
from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="API Backend – Login / Register / User Management",
    swagger_ui_parameters={"persistAuthorization": True}
)

app.include_router(api_router)
```

➡️ Hiển thị **tên project, mô tả, version** trên Swagger

---

## 5. Định nghĩa Schema (QUYẾT ĐỊNH Swagger đẹp hay xấu)

📍 **File: `schemas/user.py`**

```python
from pydantic import BaseModel, EmailStr, Field

class UserRegister(BaseModel):
    email: EmailStr = Field(..., example="user@example.com")
    password: str = Field(..., min_length=6, example="123456")

    class Config:
        schema_extra = {
            "description": "Dữ liệu tạo tài khoản mới"
        }


class UserLogin(BaseModel):
    email: EmailStr = Field(..., example="user@example.com")
    password: str = Field(..., example="123456")


class TokenResponse(BaseModel):
    access_token: str = Field(..., example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9")
    token_type: str = Field(default="bearer")
```

➡️ Schema quyết định:

* Request body
* Example Value
* Response format

---

## 6. Viết API CÓ MÔ TẢ SWAGGER (BẮT BUỘC)

📍 **File: `api/v1/auth.py`**

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.user import UserRegister, UserLogin, TokenResponse
from app.db.models import User
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Đăng ký tài khoản",
    description="Tạo tài khoản mới bằng email và password, trả về JWT token",
    responses={
        201: {"description": "Đăng ký thành công"},
        400: {"description": "Email đã tồn tại"}
    }
)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password)
    )
    db.add(user)
    db.commit()

    token = create_access_token({"sub": user.email})
    return {"access_token": token}


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Đăng nhập",
    description="Xác thực người dùng và trả về JWT token",
    responses={
        200: {"description": "Login thành công"},
        401: {"description": "Sai thông tin đăng nhập"}
    }
)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.email})
    return {"access_token": token}
```

➡️ Mỗi API **bắt buộc phải có**:

* `summary`
* `description`
* `response_model`
* `responses`
* `tags`

---

## 7. JWT Authorize trong Swagger (NÊN CÓ)

📍 **File: `main.py`**

```python
from fastapi.security import HTTPBearer
security = HTTPBearer()
```

📍 Dùng cho API cần auth:

```python
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials

@router.get(
    "/me",
    summary="Lấy thông tin user hiện tại",
    description="API yêu cầu JWT token"
)
def me(token: HTTPAuthorizationCredentials = Depends(security)):
    return {"token": token.credentials}
```

➡️ Swagger xuất hiện nút 🔒 **Authorize**

---

## 8. Checklist code review (RẤT QUAN TRỌNG)

Trước khi merge code:

* [ ] API có hiển thị trên `/docs`
* [ ] Có summary & description
* [ ] Có example request
* [ ] Có response_model
* [ ] Không hardcode config
* [ ] Group đúng tags

---

## 9. Kết luận cho dev

> Swagger không phải tài liệu viết tay.
>
> Swagger = **Code chất lượng** + **Schema rõ ràng** + **Mô tả đầy đủ**.

Nếu Swagger dễ đọc → API dễ dùng → Backend đạt chuẩn.

---

## 🔢 3️⃣ Các bước chuẩn khi thêm API mới

---



```python
## 🟢 BƯỚC 1 — Khai báo Schema (Swagger sinh từ đây)

📁 **app/schemas/user.py**

from pydantic import BaseModel, EmailStr

class CheckUserRequest(BaseModel):
    email: EmailStr

class CheckUserResponse(BaseModel):
    exists: bool
    user_id: str | None = None

✅ Việc của bước này:

Định nghĩa input / output

Swagger tự động đọc

🟢 BƯỚC 2 — Viết logic DB (TÁCH KHỎI ROUTER)

📁 app/db/models.py

from pymongo.collection import Collection

def find_user_by_email(users: Collection, email: str):
    return users.find_one({"email": email})


❌ Router không được viết query DB
✅ Router chỉ gọi hàm

🟢 BƯỚC 3 — Viết API Endpoint

📁 app/api/v1/auth.py

from fastapi import APIRouter, Depends
from app.schemas.user import CheckUserRequest, CheckUserResponse
from app.db.models import find_user_by_email
from app.db.session import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/check-user", response_model=CheckUserResponse)
def check_user(
    body: CheckUserRequest,
    db = Depends(get_db)
):
    users = db["users"]
    user = find_user_by_email(users, body.email)

    if not user:
        return {"exists": False}

    return {
        "exists": True,
        "user_id": str(user["_id"])
    }

🟢 BƯỚC 4 — Gắn router vào API version

📁 app/api/v1/router.py

from fastapi import APIRouter
from app.api.v1 import auth

api_router = APIRouter()
api_router.include_router(auth.router)


👉 Nếu quên bước này → API KHÔNG CHẠY

🟢 BƯỚC 5 — Main app tự động nhận

📁 app/main.py

from app.api.v1.router import api_router

app.include_router(api_router, prefix="/api/v1")


👉 KHÔNG sửa gì thêm

🧪 4️⃣ Kết quả cuối cùng
Endpoint
POST /api/v1/auth/check-user

Swagger
http://localhost:8000/docs


