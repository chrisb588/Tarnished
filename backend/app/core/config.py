from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", extra="ignore", env_file_encoding="utf-8"
    )

    app_name: str = "Freshlast"
    debug: bool = True
    database_url: str
    secret_key: SecretStr


config = Config()
