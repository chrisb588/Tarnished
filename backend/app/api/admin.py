# API ROUTES ACCESSIBLE ON THE ADMIN CLIENT

import json
from uuid import UUID

import passgen
from core.supabase import supabase
from fastapi import APIRouter, status
from models.admin import CreateMerchantRequestPayloadModel
from models.core import ResponseModel
from models.profile import Merchant

router = APIRouter()


# Create a merchant account
@router.post("/create", response_model=ResponseModel, tags=["Admin"])
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
        return ResponseModel(status=status.HTTP_400_BAD_REQUEST, message=str(e))

    try:
        data = (
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

        return ResponseModel(
            status=status.HTTP_200_OK,
            payload=json.dumps(
                {
                    "uuid": create_response.user.id,
                    "email": payload.email,
                    "temp-password": generated_password,
                }
            ),
            message=f"Account {create_response.user.id} with email {payload.email} has been created.\n"
            + str(data),
        )

    except Exception as e:
        # Deletes the user when it is created
        try:
            supabase.auth.admin.delete_user(create_response.user.id)

            return ResponseModel(status=status.HTTP_400_BAD_REQUEST, message=str(e))
        except Exception as e:
            return ResponseModel(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message="Error occurred when trying to clean up users table on failed create_merchant call",
            )
