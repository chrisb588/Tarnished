from pydantic import BaseModel, Json


class ResponseModel(BaseModel):
    status: int
    payload: Json | None = None
    message: str
