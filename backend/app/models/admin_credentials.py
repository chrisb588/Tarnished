from pydantic import BaseModel


class AdminCredentials(BaseModel):
    username: str
    password: str
