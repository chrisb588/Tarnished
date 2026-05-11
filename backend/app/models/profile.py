from datetime import time
from uuid import UUID

from models.enums.category import Category
from models.enums.weekday import Weekday
from models.ph_phone import PhPhone
from pydantic import BaseModel


class Merchant(BaseModel):
    id: UUID
    name: str
    phone_number: PhPhone
    latitude: float
    longitude: float
    location_photo: str | None = None
    location: str
    category: list[Category]
