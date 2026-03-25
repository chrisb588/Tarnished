# API ROUTES ACCESSIBLE ON THE ADMIN CLIENT

import json
from datetime import time
from uuid import UUID, uuid4

import passgen
from core.supabase import supabase_admin
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from models.enums.weekday import Weekday
from models.profile import Merchant
from pydantic import EmailStr

router = APIRouter()


# Create a merchant account
@router.post("/create", tags=["Admin"])
async def create_merchant(
    email: EmailStr = Form(...),
    name: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    start_operating_time: time = Form(...),
    end_operating_time: time = Form(...),
    operating_days: str = Form(...),
    location: str = Form(...),
    location_photo: UploadFile = File(...),
):
    try:
        parsed_days = [Weekday(day) for day in json.loads(operating_days)]
    except json.JSONDecodeError:
        parsed_days = [Weekday(day.strip()) for day in operating_days.split(",")]

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
    image_path = f"{user_id}/profile/{uuid4()}"

    try:
        image_bytes = await location_photo.read()
        supabase_admin.storage.from_("media").upload(
            image_path,
            image_bytes,
            file_options={"content-type": location_photo.content_type},
        )
    except Exception as e:
        supabase_admin.auth.admin.delete_user(user_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    try:
        (
            supabase_admin.table("merchant")
            .insert(
                Merchant(
                    id=UUID(user_id),
                    name=name,
                    latitude=latitude,
                    longitude=longitude,
                    location_photo=image_path,
                    start_operating_time=start_operating_time,
                    end_operating_time=end_operating_time,
                    operating_days=parsed_days,
                    location=location,
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
        try:
            supabase_admin.storage.from_("media").remove([image_path])
            supabase_admin.auth.admin.delete_user(user_id)
        except Exception as cleanup_error:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"FATAL: Failed to clean up resources after merchant insert failure: {cleanup_error}",
            )
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# Delete a merchant account
@router.delete("/delete/{id}", tags=["Admin"])
def delete_merchant(id: str):
    supabase_admin.auth.admin.delete_user(id)
