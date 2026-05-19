import logging

from dotenv import load_dotenv
from fastapi import FastAPI

from app.api.router import api_router

load_dotenv()
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Rescomail AI Service")
app.include_router(api_router)