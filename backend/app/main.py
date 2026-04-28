import os

from api.admin import router as admin_router
from api.listings import router as listings_router
from api.profile import router as profile_router
from core.config import config
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title=config.app_name)

# Add routes
API_PREFIX = "/api"

app.include_router(listings_router, prefix=f"{API_PREFIX}/listings")
app.include_router(profile_router, prefix=f"{API_PREFIX}/profile")
app.include_router(admin_router, prefix="/api/admin")

# Add CORS Middleware
origins_raw = os.getenv("ORIGINS", "")
origins = [o for o in origins_raw.split(" ") if o]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "PUT", "POST", "DELETE", "PATCH"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Freshlast API"}
