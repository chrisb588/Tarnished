from uuid import UUID, uuid4

from core.supabase import supabase
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from models.enums.category import Category
from models.listing import Listing

router = APIRouter()


# Create listing
@router.post("", tags=["Listings"])
async def create_listing(
    merchant_id: str = Form(...),
    name: str = Form(...),
    original_price: float = Form(0),
    discounted_price: float = Form(0),
    unit: str = Form(...),
    quantity: int = Form(0),
    image: UploadFile = File(None),
    type: Category = Form(...),
):
    image_url = None
    image_path = None

    # Upload listing image to bucket if the user passed an image
    if image is not None:
        image_path = f"{merchant_id}/listings/{uuid4()}"

        try:
            image_bytes = await image.read()
            supabase.storage.from_("media").upload(
                image_path,
                image_bytes,
                file_options={"content-type": image.content_type},
            )

            image_url = supabase.storage.from_("media").get_public_url(image_path)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    try:
        # Insert new listing to listing table
        payload = Listing(
            merchant_id=UUID(merchant_id),
            name=name,
            original_price=original_price,
            discounted_price=discounted_price,
            image=image_url,
            unit=unit,
            quantity=quantity,
            type=type,
        ).model_dump(mode="json")
        data = supabase.table("listing").insert(payload).execute()

        return data.data[0]

    except Exception as e:
        # Cleanup any uploaded images upon error
        if image_path is not None:
            try:
                supabase.storage.from_("media").remove([image_path])
            except Exception as cleanup_error:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"FATAL: Failed to clean up resources after listing insert failure: {cleanup_error}",
                )

        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# Get all listings
@router.get("/all", tags=["Listings"])
async def get_all_listings():
    data = supabase.table("listing").select("*").execute()
    return data.data


# Get listings by merchant
@router.get("", tags=["Listings"])
async def get_listings(merchant_id: str):
    try:
        data = (
            supabase.table("listing")
            .select("*")
            .eq("merchant_id", merchant_id)
            .execute()
        )
        return data.data
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# Get single listing
@router.get("/{listing_id}", tags=["Listings"])
async def get_listing(listing_id: str):
    try:
        data = supabase.table("listing").select("*").eq("id", listing_id).execute()
        return data.data[0] if data.data else None
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# Edit listing
@router.put("/{listing_id}", tags=["Listings"])
async def update_listing(
    listing_id: str,
    merchant_id: str = Form(...),
    name: str = Form(...),
    original_price: float = Form(0),
    discounted_price: float = Form(0),
    unit: str = Form(...),
    quantity: int = Form(0),
    image: UploadFile = File(None),
    type: Category = Fomr(...),
):
    # Get current listing entry
    listing_result = (
        supabase.table("listing")
        .select("image")
        .eq("id", listing_id)
        .single()
        .execute()
    )
    old_image_url = listing_result.data["image"] if listing_result.data else None
    image_url = old_image_url

    # Upload image to bucket if the user wants to modify the image
    new_image_path = None
    if image is not None:
        new_image_path = f"{merchant_id}/listings/{uuid4()}"

        try:
            image_bytes = await image.read()
            supabase.storage.from_("media").upload(
                new_image_path,
                image_bytes,
                file_options={"content-type": image.content_type},
            )

            image_url = supabase.storage.from_("media").get_public_url(new_image_path)

        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    # Perform update operation on listing table
    try:
        payload = Listing(
            merchant_id=UUID(merchant_id),
            name=name,
            original_price=original_price,
            discounted_price=discounted_price,
            image=image_url,
            unit=unit,
            quantity=quantity,
            type=type,
        ).model_dump(mode="json")
        data = supabase.table("listing").update(payload).eq("id", listing_id).execute()

        # Whenever the image is updated, remove the old image from the bucket
        if new_image_path is not None and old_image_url is not None:
            old_image_path = "/".join(
                old_image_url.split("/storage/v1/object/public/media/")[1:]
            )
            supabase.storage.from_("media").remove([old_image_path])

        return data.data[0]
    except Exception as e:
        # Cleanup any uploaded images upon error
        if new_image_path is not None:
            try:
                supabase.storage.from_("media").remove([new_image_path])
            except Exception as cleanup_error:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"FATAL: Failed to clean up resources after listing update failure: {cleanup_error}",
                )

        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# Delete listing
@router.delete("/{listing_id}", tags=["Listings"])
async def delete_listing(listing_id: str):
    try:
        # Get current listing entry
        listing_result = (
            supabase.table("listing")
            .select("image")
            .eq("id", listing_id)
            .single()
            .execute()
        )
        old_image_url = listing_result.data["image"] if listing_result.data else None

        data = supabase.table("listing").delete().eq("id", listing_id).execute()

        # Remove image from bucket if it exists
        if old_image_url is not None:
            old_image_path = "/".join(
                old_image_url.split("/storage/v1/object/public/media/")[1:]
            )
            supabase.storage.from_("media").remove([old_image_path])

        return data.data[0]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
