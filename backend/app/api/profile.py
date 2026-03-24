from core.supabase import supabase
from fastapi import APIRouter
from models.profile import Merchant

router = APIRouter()


# Get merchant details
@router.get("/{id}")
async def get_listing(id: str):
    data = supabase.table("merchant").select("*").eq("id", id).execute()
    return data.data[0] if data.data else None


# Edit merchant details
@router.put("/{id}")
async def update_listing(id: str, merchant: Merchant):
    payload = merchant.model_dump(mode="json")
    data = supabase.table("merchant").update(payload).eq("id", id).execute()
    return data.data
