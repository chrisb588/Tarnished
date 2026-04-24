# API ROUTES ACCESSIBLE ON THE ADMIN CLIENT

import json
import os
import re
from datetime import datetime, time, timedelta
from uuid import UUID, uuid4

import jwt
import passgen
from core.supabase import supabase_admin
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from middleware.auth_middleware import verify_admin
from models.admin_credentials import AdminCredentials
from models.enums.category import Category
from models.enums.weekday import Weekday
from models.ph_phone import PhPhone
from models.profile import Merchant
from pydantic import EmailStr

router = APIRouter()
load_dotenv()

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
ADMIN_JWT_SECRET = os.getenv("ADMIN_JWT_SECRET")


# Authenticates an admin user to be able to access the admin endpoints
@router.post("/auth/login", tags=["Admin"])
async def login_admin(credentials: AdminCredentials):
    print(ADMIN_USERNAME, ADMIN_PASSWORD)
    if credentials.username != ADMIN_USERNAME or credentials.password != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials"
        )

    token = jwt.encode(
        {"sub": "admin", "exp": datetime.now() + timedelta(hours=1)},
        ADMIN_JWT_SECRET,
        algorithm="HS256",
    )

    return {"access_token": token}


# Checks if the admin's JWT token is still valid
@router.get("/auth/verify", tags=["Admin"])
async def is_admin_authenticated(_: None = Depends(verify_admin)):
    return {"valid": True}


# Create a merchant account
@router.post("/create", tags=["Admin"])
async def create_merchant(
    email: EmailStr = Form(...),
    name: str = Form(...),
    phone_number: PhPhone = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    start_operating_time: time = Form(...),
    end_operating_time: time = Form(...),
    operating_days: str = Form(...),
    location: str = Form(...),
    location_photo: UploadFile = File(...),
    category: str = Form(...),
    _: None = Depends(verify_admin),
):
    # Add a layer of validation of location photo to verify it is indeed an image file
    IMAGE_MIME_PATTERN = re.compile(r"^image/.+$")
    if location_photo is not None and not IMAGE_MIME_PATTERN.match(
        location_photo.content_type or ""
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Invalid file type. Only image files are allowed",
        )

    # Parse operating days string as an array
    try:
        parsed_days = [Weekday(day) for day in json.loads(operating_days)]
    except Exception:
        try:
            parsed_days = [Weekday(day.strip()) for day in operating_days.split(",")]
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Invalid data format for category field. It should be an array containing 'vegetable', 'fruit', 'chicken', 'pork', 'beef', and/or 'seafood'.",
            )

    # Parse category string as an array
    try:
        parsed_categories = [Category(c) for c in json.loads(category)]
    except Exception:
        try:
            parsed_categories = [Category(c.strip()) for c in category.split(",")]
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Invalid data format for category field. It should be an array containing 'vegetable', 'fruit', 'chicken', 'pork', 'beef', and/or 'seafood'",
            )

    # Create a new user for the vendor
    try:
        generated_password = passgen.passgen(length=8)
        create_response = supabase_admin.auth.admin.create_user(
            {
                "email": email,
                "password": generated_password,
                "email_confirm": True,
            }
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    user_id = create_response.user.id

    # Upload the image to the bucket
    image_path = f"{user_id}/profile/{uuid4()}"
    try:
        image_bytes = await location_photo.read()
        supabase_admin.storage.from_("media").upload(
            image_path,
            image_bytes,
            file_options={"content-type": location_photo.content_type},
        )

        # Construct image URL from uploaded image
        image_link = supabase_admin.storage.from_("media").get_public_url(image_path)
    except Exception as e:
        supabase_admin.auth.admin.delete_user(user_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    try:
        # Perform insert operation
        (
            supabase_admin.table("merchant")
            .insert(
                Merchant(
                    id=UUID(user_id),
                    name=name,
                    phone_number=phone_number,
                    latitude=latitude,
                    longitude=longitude,
                    location_photo=image_link,
                    start_operating_time=start_operating_time,
                    end_operating_time=end_operating_time,
                    operating_days=parsed_days,
                    location=location,
                    category=parsed_categories,
                ).model_dump(mode="json")
            )
            .execute()
        )

        return {
            "uuid": user_id,
            "email": email,
            "temp_password": generated_password,
        }
    except Exception as e:
        original_error = str(e)

        # Cleanup any uploaded images upon error
        try:
            supabase_admin.storage.from_("media").remove([image_path])
            supabase_admin.auth.admin.delete_user(user_id)
        except Exception as cleanup_error:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"FATAL: Failed to clean up resources after merchant insert failure: {cleanup_error}",
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=original_error
        )


# Get all merchant accounts
@router.get("/merchants", tags=["Admin"])
def get_all_merchants(
    _: None = Depends(verify_admin),
):
    try:
        return supabase_admin.table("merchant").select("*").execute().data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


# Delete a merchant account
@router.delete("/delete/{id}", tags=["Admin"])
def delete_merchant(
    id: str,
    _: None = Depends(verify_admin),
):
    try:
        # Retrieve all uploaded images from the vendor
        files = supabase_admin.storage.from_("media").list(id)

        # Deletes all uploaded images
        for folder in files:
            folder_name = folder["name"]
            nested = supabase_admin.storage.from_("media").list(f"{id}/{folder_name}")
            paths = [f"{id}/{folder_name}/{file['name']}" for file in nested]
            if paths:
                supabase_admin.storage.from_("media").remove(paths)
        supabase_admin.storage.from_("media").remove([f"{id}"])
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    # Deletes the user account
    try:
        return supabase_admin.auth.admin.delete_user(id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
