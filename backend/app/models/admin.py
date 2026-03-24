from datetime import time

from models.enums.weekday import Weekday
from pydantic import BaseModel, EmailStr


class CreateMerchantRequestPayloadModel(BaseModel):
    email: EmailStr
    name: str
    latitude: float
    longitude: float
    location_photo: str
    start_operating_time: time
    end_operating_time: time
    operating_days: list[Weekday]
    location: str
