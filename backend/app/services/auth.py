import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Union
from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import JWT_SECRET_KEY, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from app.database.mongodb import get_users_coll

security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hashes a plain text password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against the hashed password."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a signed JWT access token with an expiration time."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """Decodes and validates a JWT token."""
    return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])


def get_user_by_username(username: str) -> Optional[dict]:
    """Retrieves a user document from MongoDB by username (case-insensitive)."""
    users_coll = get_users_coll()
    return users_coll.find_one({"username": {"$regex": f"^{username}$", "$options": "i"}})


def create_user(
    username: str,
    password_hash: str,
    role: str = "user",
    email: Optional[str] = None,
    is_active: bool = True,
) -> dict:
    """Creates a new user record in MongoDB."""
    users_coll = get_users_coll()
    user_doc = {
        "username": username,
        "password_hash": password_hash,
        "role": role,
        "email": email,
        "is_active": is_active,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = users_coll.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return user_doc


def get_all_users() -> List[dict]:
    """Retrieves all registered users from MongoDB."""
    users_coll = get_users_coll()
    users = list(users_coll.find({}))
    results = []
    for u in users:
        results.append({
            "id": str(u["_id"]),
            "username": u["username"],
            "email": u.get("email"),
            "role": u.get("role", "user"),
            "is_active": u.get("is_active", True),
            "created_at": u.get("created_at"),
        })
    return results


def get_user_by_id(user_id: str) -> Optional[dict]:
    """Retrieves a user document by ObjectId."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        return None
    users_coll = get_users_coll()
    return users_coll.find_one({"_id": oid})


def update_user_status(user_id: str, is_active: bool) -> bool:
    """Updates the is_active status of a user."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        return False
    users_coll = get_users_coll()
    res = users_coll.update_one({"_id": oid}, {"$set": {"is_active": is_active}})
    return res.matched_count > 0


def update_user_role(user_id: str, role: str) -> bool:
    """Updates the role of a user."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        return False
    users_coll = get_users_coll()
    res = users_coll.update_one({"_id": oid}, {"$set": {"role": role}})
    return res.matched_count > 0


def delete_user_by_id(user_id: str) -> bool:
    """Deletes a user record by ObjectId."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        return False
    users_coll = get_users_coll()
    res = users_coll.delete_one({"_id": oid})
    return res.deleted_count > 0


async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    """
    Authentication Dependency:
    Extracts and validates the JWT Bearer token from the request Authorization header.
    Returns the authenticated user details (id, username, email, role, is_active).
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials: invalid token signature",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = get_user_by_username(username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with this token no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact an administrator.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user.get("email"),
        "role": user.get("role", "user"),
        "is_active": user.get("is_active", True),
        "created_at": user.get("created_at"),
    }


def require_role(allowed_roles: Union[List[str], str]):
    """
    Authorization Dependency:
    Ensures that the authenticated user possesses one of the required roles.
    Raises 403 Forbidden if unauthorized.
    """
    roles_list = [allowed_roles] if isinstance(allowed_roles, str) else allowed_roles

    def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        user_role = current_user.get("role", "user")
        if user_role not in roles_list:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires role '{' or '.join(roles_list)}'. Current role is '{user_role}'.",
            )
        return current_user

    return role_checker


# Convenient role-based dependencies
require_admin = require_role(["admin"])
require_authenticated = get_current_user
