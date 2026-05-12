import json
import re
from uuid import UUID, uuid4

from constants.week import WEEK
from core.supabase import supabase
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from models.enums.category import Category
from models.operating_hours import OperatingHours
from models.ph_phone import PhPhone
from models.profile import Merchant
from models.schedule import Schedule

router = APIRouter()


# Get merchant details
@router.get("/{id}", tags=["Profile"])
async def get_merchant(id: str):
    try:
        return (
            supabase.table("merchant")
            .select("*, operating_days:schedule(*)")
            .eq("id", id)
            .single()
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# Edit merchant details
@router.put("/{id}", tags=["Profile"])
async def update_merchant(
    id: str,
    name: str = Form(...),
    phone_number: PhPhone = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    operating_days: str = Form(...),
    location: str = Form(...),
    location_photo: UploadFile = File(None),
    category: str = Form(...),
):
    # Parse category string as an array
    try:
        parsed_categories = [Category(c) for c in json.loads(category)]
    except Exception:
        try:
            parsed_categories = [Category(c.strip()) for c in category.split(",")]
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Invalid data format for operating days field. It should be an array containing 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', and/or 'Sat'",
            )

    # Parse operating days
    try:
        parsed_days = {
            k: OperatingHours(**v) for k, v in json.loads(operating_days).items()
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Operating days not in proper JSON format.",
        )

    # Raise error if operating days is empty
    if len(parsed_days) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Operating days cannot be empty.",
        )

    # Validate operating days
    for day, sched in parsed_days.items():
        if day not in WEEK:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Invalid data format for operating days. It should only contain 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', and 'Sat' entries.",
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

        old_image_url = (
            merchant_result.data["location_photo"] if merchant_result.data else None
        )
        image_url = old_image_url

        # Fetch current schedule and store it for potential rollback
        schedule_result = (
            supabase.table("schedule").select("*").eq("merchant_id", id).execute()
        )
        old_schedule = {row["day"]: row for row in (schedule_result.data or [])}

        # Upload new image if provided
        new_image_path = None
        if location_photo is not None:
            new_image_path = f"{id}/profile/{uuid4()}"
            try:
                image_bytes = await location_photo.read()
                supabase.storage.from_("media").upload(
                    new_image_path,
                    image_bytes,
                    file_options={"content-type": location_photo.content_type},
                )
                image_url = supabase.storage.from_("media").get_public_url(
                    new_image_path
                )
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
                )

        # Track which schedule operations succeeded for rollback
        inserted_days = []
        deleted_days = []
        updated_days = []

        try:
            # Perform merchant update
            payload = Merchant(
                id=UUID(id),
                name=name,
                phone_number=phone_number,
                latitude=latitude,
                longitude=longitude,
                location_photo=image_url,
                location=location,
                category=parsed_categories,
            ).model_dump(mode="json")
            data = supabase.table("merchant").update(payload).eq("id", id).execute()

            new_days = set(parsed_days.keys())
            old_days = set(old_schedule.keys())

            # Insert days that are in new schedule but not in old
            for day in new_days - old_days:
                sched = parsed_days[day]
                supabase.table("schedule").insert(
                    Schedule(
                        merchant_id=UUID(id),
                        day=day,
                        start_time=sched.start_time,
                        end_time=sched.end_time,
                    ).model_dump(mode="json")
                ).execute()
                inserted_days.append(day)

            # Delete days that are in old schedule but not in new
            for day in old_days - new_days:
                supabase.table("schedule").delete().eq("merchant_id", id).eq(
                    "day", day
                ).execute()
                deleted_days.append(day)

            # Update days that exist in both but have different times
            for day in new_days & old_days:
                sched = parsed_days[day]
                old = old_schedule[day]
                if (
                    sched.start_time != old["start_time"]
                    or sched.end_time != old["end_time"]
                ):
                    supabase.table("schedule").update(
                        {
                            "start_time": str(sched.start_time),
                            "end_time": str(sched.end_time),
                        }
                    ).eq("merchant_id", id).eq("day", day).execute()
                    updated_days.append(day)

            # Remove old image from bucket if image was updated
            if new_image_path is not None and old_image_url is not None:
                old_image_path = "/".join(
                    old_image_url.split("/storage/v1/object/public/media/")[1:]
                )
                supabase.storage.from_("media").remove([old_image_path])

            return (
                supabase.from_("merchant")
                .select("*, operating_days:schedule(*)")
                .eq("id", id)
                .single()
                .execute()
                .data
            )

        except Exception as e:
            # Rollback schedule changes
            for day in inserted_days:
                supabase.table("schedule").delete().eq("merchant_id", id).eq(
                    "day", day
                ).execute()
            for day in deleted_days:
                old = old_schedule[day]
                supabase.table("schedule").insert(
                    Schedule(
                        merchant_id=id,
                        day=day,
                        start_time=old["start_time"],
                        end_time=old["end_time"],
                    ).model_dump(mode="json")
                ).execute()
            for day in updated_days:
                old = old_schedule[day]
                supabase.table("schedule").update(
                    {
                        "start_time": str(old["start_time"]),
                        "end_time": str(old["end_time"]),
                    }
                ).eq("merchant_id", id).eq("day", day).execute()

            # Cleanup any uploaded image
            if new_image_path is not None:
                supabase.storage.from_("media").remove([new_image_path])

            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
