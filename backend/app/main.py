import os

import api.listings as listings
from core.config import config
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title=config.app_name)

# Add routes
app.include_router(listings.router, prefix="/api")

# Add CORS Middleware
origins = os.getenv("ORIGINS")
origins = "" if origins is None else origins
origins = [i for i in origins.split(" ")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "PUT", "POST", "DELETE"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Freshlast API"}
