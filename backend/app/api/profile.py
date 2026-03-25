import json
from datetime import time
from uuid import UUID, uuid4

from core.supabase import supabase
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from models.enums.weekday import Weekday
from models.profile import Merchant

router = APIRouter()


# Get merchant details
@router.get("/{id}", tags=["Profile"])
async def get_listing(id: str):
    data = supabase.table("merchant").select("*").eq("id", id).execute()
    return data.data[0] if data.data else None


# Edit merchant details
@router.put("/{id}", tags=["Profile"])
async def update_listing(
    id: str,
    name: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    start_operating_time: time = Form(...),
    end_operating_time: time = Form(...),
    operating_days: str = Form(...),
    location: str = Form(...),
    location_photo: UploadFile = File(None),
):
    try:
        parsed_days = [Weekday(day) for day in json.loads(operating_days)]
    except json.JSONDecodeError:
        try:
            parsed_days = [Weekday(day.strip()) for day in operating_days.split(",")]
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Invalid data format for operating days field. It should be an array containing 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', and/or 'Saturday'",
            )

    merchant_result = (
        supabase.table("merchant")
        .select("location_photo")
        .eq("id", id)
        .single()
        .execute()
    )
    old_image_path = (
        merchant_result.data["location_photo"] if merchant_result.data else None
    )

    image_path = old_image_path
    if location_photo is not None:
        image_path = f"{id}/profile/{uuid4()}"
        try:
            image_bytes = await location_photo.read()
            supabase.storage.from_("media").upload(
                image_path,
                image_bytes,
                file_options={"content-type": location_photo.content_type},
            )
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    try:
        parsed_days = [Weekday(day) for day in json.loads(operating_days)]
    except json.JSONDecodeError:
        parsed_days = [Weekday(day.strip()) for day in operating_days.split(",")]

    public_url = supabase.storage.from_("media").get_public_url(image_path)

    try:
        payload = Merchant(
            id=UUID(id),
            name=name,
            latitude=latitude,
            longitude=longitude,
            location_photo=image_path,
            start_operating_time=start_operating_time,
            end_operating_time=end_operating_time,
            operating_days=parsed_days,
            location=location,
        ).model_dump(mode="json")
        data = supabase.table("merchant").update(payload).eq("id", id).execute()
        if location_photo is not None and old_image_path:
            supabase.storage.from_("media").remove([old_image_path])
        return {**data.data[0], "location_photo": public_url}
    except Exception as e:
        if location_photo is not None:
            supabase.storage.from_("media").remove([image_path])
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
