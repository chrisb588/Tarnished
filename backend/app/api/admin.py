# API ROUTES ACCESSIBLE ON THE ADMIN CLIENT

from uuid import UUID

import passgen
from core.supabase import supabase
from fastapi import APIRouter, HTTPException, status
from models.admin import CreateMerchantRequestPayloadModel
from models.profile import Merchant

router = APIRouter()


# Create a merchant account
@router.post("/create", tags=["Admin"])
def create_merchant(payload: CreateMerchantRequestPayloadModel):
    try:
        generated_password = passgen.passgen(length=8)

        create_response = supabase.auth.admin.create_user(
            {
                "email": payload.email,
                "password": generated_password,
                "email_confirm": True,
            }
        )
    except Exception as e:
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    try:
        (
            supabase.table("merchant")
            .insert(
                Merchant(
                    id=UUID(create_response.user.id),
                    name=payload.name,
                    latitude=payload.latitude,
                    longitude=payload.longitude,
                    start_operating_time=payload.start_operating_time,
                    end_operating_time=payload.end_operating_time,
                    operating_days=payload.operating_days,
                    location=payload.location,
                ).model_dump(mode="json")
            )
            .execute()
        )

        return {
            "uuid": create_response.user.id,
            "email": payload.email,
            "temp_password": generated_password,
        }

    except Exception as e:
        # Deletes the user when it is created
        try:
            supabase.auth.admin.delete_user(create_response.user.id)

            return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
        except Exception as e:
            return HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error occurred when trying to clean up users table on failed create_merchant call",
            )


# Delete a merchant account
@router.delete("/{id}")
def delete_merchant(id: str):
    supabase.auth.admin.delete_user(id)
