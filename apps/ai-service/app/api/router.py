from fastapi import APIRouter

from app.api.routes.ats import router as ats_router
from app.api.routes.health import router as health_router
from app.api.routes.resume_parser import router as resume_parser_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(resume_parser_router)
api_router.include_router(ats_router)
