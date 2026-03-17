from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel


class Weekday(Enum):
    SUNDAY = "Sunday"
    MONDAY = "Monday"
    TUESDAY = "Tuesday"
    WEDNESDAY = "Wednesday"
    THURSDAY = "Thursday"
    FRIDAY = "Friday"
    SATRUDAY = "Saturday"


class Merchant(BaseModel):
    id: UUID
    name: str
    latitude: float
    longitude: float
    location_photo: str | None = None
    start_operating_time: datetime
    end_operating_time: datetime
    operating_days: list[Weekday]
    location: str
