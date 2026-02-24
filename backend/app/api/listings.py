from core.supabase import supabase
from fastapi import APIRouter
from models.listing import Listing

router = APIRouter()


# Create listing
@router.post("/listing")
async def create_listing(listing: Listing):
    payload = listing.model_dump(mode="json")
    data = supabase.table("listing").insert(payload).execute()

    return data.data


# Edit listings


# Delete listings
