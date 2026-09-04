from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class FormatEntryRequest(BaseModel):
    prompt: str
    imageUrl: str | None = None


class GatewayResponse(BaseModel):
    raw: str


@router.post("/format-entry", response_model=GatewayResponse)
async def format_entry(body: FormatEntryRequest) -> GatewayResponse:
    return GatewayResponse(raw="stub response")
