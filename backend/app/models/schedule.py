from datetime import time
from uuid import UUID

from pydantic import BaseModel


class Schedule(BaseModel):
    merchant_id: UUID
    day: str
    start_time: time
    end_time: time
