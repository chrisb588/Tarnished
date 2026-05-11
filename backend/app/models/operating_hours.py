from datetime import time

from pydantic import BaseModel


class OperatingHours(BaseModel):
    start_time: time
    end_time: time
