from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    TokenResponse,
    UserOut,
    UserCreateAdmin,
    UserStatusUpdate,
    UserRoleUpdate,
)
from app.services.auth import (
    get_user_by_username,
    create_user,
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_admin,
    get_all_users,
    get_user_by_id,
    update_user_status,
    update_user_role,
    delete_user_by_id,
)
from app.database.mongodb import get_users_coll

router = APIRouter(prefix="/api/auth", tags=["Authentication & Authorization"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: UserRegister):
    """
    Public registration endpoint:
    - Users cannot choose their role; all public registrations are assigned role 'user'.
    - If this is the very first registered user in the system, they are initialized as 'admin'.
    """
    clean_username = request.username.strip()
    if not clean_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username cannot be empty",
        )

    # Check if username already taken
    existing_user = get_user_by_username(clean_username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Username '{clean_username}' is already taken. Please choose another.",
        )

    # First user automatically becomes admin, all other public registrations are strictly 'user'
    users_coll = get_users_coll()
    is_first_user = users_coll.count_documents({}) == 0
    role = "admin" if is_first_user else "user"

    hashed_pw = hash_password(request.password)
    user_doc = create_user(
        username=clean_username,
        password_hash=hashed_pw,
        role=role,
        email=request.email.strip() if request.email else None,
        is_active=True,
    )

    user_out = UserOut(
        id=str(user_doc["_id"]),
        username=user_doc["username"],
        email=user_doc.get("email"),
        role=user_doc["role"],
        is_active=user_doc.get("is_active", True),
        created_at=user_doc.get("created_at"),
    )

    access_token = create_access_token(
        data={"sub": user_doc["username"], "role": user_doc["role"], "user_id": str(user_doc["_id"])}
    )

    return TokenResponse(access_token=access_token, token_type="bearer", user=user_out)


@router.post("/login", response_model=TokenResponse)
def login(request: UserLogin):
    """
    Authenticate user credentials and issue a JWT Bearer token.
    Enforces active account status.
    """
    clean_username = request.username.strip()
    user = get_user_by_username(clean_username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(request.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact an administrator.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_out = UserOut(
        id=str(user["_id"]),
        username=user["username"],
        email=user.get("email"),
        role=user.get("role", "user"),
        is_active=user.get("is_active", True),
        created_at=user.get("created_at"),
    )

    access_token = create_access_token(
        data={"sub": user["username"], "role": user.get("role", "user"), "user_id": str(user["_id"])}
    )

    return TokenResponse(access_token=access_token, token_type="bearer", user=user_out)


@router.get("/me", response_model=UserOut)
def get_profile(current_user: dict = Depends(get_current_user)):
    """
    Get the authenticated user's profile, role, and active status.
    """
    return UserOut(
        id=current_user["id"],
        username=current_user["username"],
        email=current_user.get("email"),
        role=current_user.get("role", "user"),
        is_active=current_user.get("is_active", True),
        created_at=current_user.get("created_at"),
    )


# ==========================================
# Admin User Management Endpoints
# ==========================================

admin_router = APIRouter(prefix="/api/admin/users", tags=["Admin User Management"])


@admin_router.get("", response_model=List[UserOut])
def list_users(current_admin: dict = Depends(require_admin)):
    """
    Admin only: List all registered users in the system.
    """
    users = get_all_users()
    return [
        UserOut(
            id=u["id"],
            username=u["username"],
            email=u.get("email"),
            role=u.get("role", "user"),
            is_active=u.get("is_active", True),
            created_at=u.get("created_at"),
        )
        for u in users
    ]


@admin_router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def admin_create_user(request: UserCreateAdmin, current_admin: dict = Depends(require_admin)):
    """
    Admin only: Create a new user with an assigned role ('user' or 'admin') and initial status.
    """
    clean_username = request.username.strip()
    if not clean_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username cannot be empty",
        )

    existing_user = get_user_by_username(clean_username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Username '{clean_username}' is already taken.",
        )

    role = (request.role or "user").lower()
    if role not in ["user", "admin"]:
        role = "user"

    hashed_pw = hash_password(request.password)
    user_doc = create_user(
        username=clean_username,
        password_hash=hashed_pw,
        role=role,
        email=request.email.strip() if request.email else None,
        is_active=request.is_active,
    )

    return UserOut(
        id=str(user_doc["_id"]),
        username=user_doc["username"],
        email=user_doc.get("email"),
        role=user_doc["role"],
        is_active=user_doc.get("is_active", True),
        created_at=user_doc.get("created_at"),
    )


@admin_router.patch("/{user_id}/status")
def admin_update_user_status(
    user_id: str,
    body: UserStatusUpdate,
    current_admin: dict = Depends(require_admin),
):
    """
    Admin only: Activate or deactivate a user account.
    Prevents an admin from deactivating their own account.
    """
    if str(current_admin["id"]) == user_id and not body.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own administrative account.",
        )

    target_user = get_user_by_id(user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    success = update_user_status(user_id, body.is_active)
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update user status")

    action_label = "activated" if body.is_active else "deactivated"
    return {"message": f"User '{target_user['username']}' has been {action_label}.", "is_active": body.is_active}


@admin_router.patch("/{user_id}/role")
def admin_update_user_role(
    user_id: str,
    body: UserRoleUpdate,
    current_admin: dict = Depends(require_admin),
):
    """
    Admin only: Change a user's role ('user' or 'admin').
    """
    new_role = body.role.lower()
    if new_role not in ["user", "admin"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role must be 'user' or 'admin'")

    target_user = get_user_by_id(user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    success = update_user_role(user_id, new_role)
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update role")

    return {"message": f"Role for user '{target_user['username']}' updated to '{new_role}'.", "role": new_role}


@admin_router.delete("/{user_id}")
def admin_delete_user(
    user_id: str,
    current_admin: dict = Depends(require_admin),
):
    """
    Admin only: Delete a user account.
    Prevents self-deletion.
    """
    if str(current_admin["id"]) == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own administrative account.",
        )

    target_user = get_user_by_id(user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    success = delete_user_by_id(user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete user")

    return {"message": f"User '{target_user['username']}' has been deleted."}

