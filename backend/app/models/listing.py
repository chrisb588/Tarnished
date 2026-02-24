import json
from uuid import UUID

from pydantic import BaseModel


class Listing(BaseModel):
    merchant_id: UUID
    name: str
    price: float = 0
    image: bytes | None = None
    unit: str
    quantity: int = 0
    expiration_details: str | None = None
