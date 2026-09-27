from pydantic import BaseModel, Field
from typing import Optional

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    password: str = Field(..., min_length=4, max_length=128, description="Password")
    email: Optional[str] = Field(None, description="Optional user email")

class UserLogin(BaseModel):
    username: str = Field(..., description="Username")
    password: str = Field(..., description="Password")

class UserCreateAdmin(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    password: str = Field(..., min_length=4, max_length=128, description="Password")
    email: Optional[str] = Field(None, description="Optional user email")
    role: str = Field("user", description="Assigned role: 'user' or 'admin'")
    is_active: bool = Field(True, description="Account active status")

class UserStatusUpdate(BaseModel):
    is_active: bool = Field(..., description="Account status: true for active, false for inactive")

class UserRoleUpdate(BaseModel):
    role: str = Field(..., description="Role: 'user' or 'admin'")

class UserOut(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    role: str
    is_active: bool = True
    created_at: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
