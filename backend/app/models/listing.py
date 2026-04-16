from uuid import UUID

from enums.category import Category
from pydantic import BaseModel


class Listing(BaseModel):
    merchant_id: UUID
    name: str
    original_price: float = 0
    discounted_price: float = 0
    image: str | None = None
    unit: str
    quantity: int = 0
    type: Category
