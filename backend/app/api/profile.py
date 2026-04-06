import json
import re
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
    try:
        return supabase.table("merchant").select("*").eq("id", id).single().execute()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


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
    # Parse operating days string as an array
    try:
        parsed_days = [Weekday(day) for day in json.loads(operating_days)]
    except Exception:
        try:
            parsed_days = [Weekday(day.strip()) for day in operating_days.split(",")]
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Invalid data format for operating days field. It should be an array containing 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', and/or 'Sat'",
            )

    # Add a layer of validation of location photo to verify it is indeed an image file
    IMAGE_MIME_PATTERN = re.compile(r"^image/.+$")
    if location_photo is not None and not IMAGE_MIME_PATTERN.match(
        location_photo.content_type or ""
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Invalid file type. Only image files are allowed",
        )

    try:
        # Get current merchant entry
        merchant_result = (
            supabase.table("merchant")
            .select("location_photo")
            .eq("id", id)
            .single()
            .execute()
        )

        # Retrieve image URL from merchant entry
        old_image_url = (
            merchant_result.data["location_photo"] if merchant_result.data else None
        )
        image_url = old_image_url

        # If the vendors wants to update the image, upload that image to the bucket
        new_image_path = None
        if location_photo is not None:
            # Construct path of new image
            new_image_path = f"{id}/profile/{uuid4()}"

            try:
                image_bytes = await location_photo.read()
                supabase.storage.from_("media").upload(
                    new_image_path,
                    image_bytes,
                    file_options={"content-type": location_photo.content_type},
                )

                # Construct URL of new image
                image_url = supabase.storage.from_("media").get_public_url(
                    new_image_path
                )
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
                )

        try:
            # Perform update operation
            payload = Merchant(
                id=UUID(id),
                name=name,
                latitude=latitude,
                longitude=longitude,
                location_photo=image_url,
                start_operating_time=start_operating_time,
                end_operating_time=end_operating_time,
                operating_days=parsed_days,
                location=location,
            ).model_dump(mode="json")
            data = supabase.table("merchant").update(payload).eq("id", id).execute()

            # Whenever the image is updated, remove the old image from the bucket
            if new_image_path is not None and old_image_url is not None:
                # Retrieve the image path of the old image URL
                old_image_path = "/".join(
                    old_image_url.split("/storage/v1/object/public/media/")[1:]
                )

                supabase.storage.from_("media").remove([old_image_path])

            return data.data[0]
        except Exception as e:
            # Cleanup any uploaded image upon error
            if new_image_path is not None:
                supabase.storage.from_("media").remove([new_image_path])

            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
