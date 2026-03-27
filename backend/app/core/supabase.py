from core.config import config

from supabase import Client, create_client

supabase: Client = create_client(
    config.database_url, config.secret_key.get_secret_value()
)

supabase_admin: Client = create_client(
    config.database_url, config.secret_key.get_secret_value()
)
