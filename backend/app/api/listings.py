from core.supabase import supabase
from fastapi import APIRouter
from models.listing import Listing

router = APIRouter()


# Create listing
@router.post("")
async def create_listing(listing: Listing):
    payload = listing.model_dump(mode="json")
    data = supabase.table("listing").insert(payload).execute()

    return data.data


# Get listings by merchant
@router.get("")
async def get_listings(merchant_id: str):
    data = (
        supabase.table("listing").select("*").eq("merchant_id", merchant_id).execute()
    )
    return data.data


# Get single listing
@router.get("/{listing_id}")
async def get_listing(listing_id: str):
    data = supabase.table("listing").select("*").eq("id", listing_id).execute()
    return data.data[0] if data.data else None


# Edit listing
@router.put("/{listing_id}")
async def update_listing(listing_id: str, listing: Listing):
    payload = listing.model_dump(mode="json")
    data = supabase.table("listing").update(payload).eq("id", listing_id).execute()
    return data.data


# Delete listing
@router.delete("/{listing_id}")
async def delete_listing(listing_id: str):
    data = supabase.table("listing").delete().eq("id", listing_id).execute()
    return data.data
