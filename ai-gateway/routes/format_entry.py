import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import gemini_client

router = APIRouter()


class FormatEntryRequest(BaseModel):
    prompt: str
    imageUrl: str | None = None


class GatewayResponse(BaseModel):
    raw: str


@router.post("/format-entry", response_model=GatewayResponse)
async def format_entry(body: FormatEntryRequest) -> GatewayResponse:
    try:
        if body.imageUrl:
            async with httpx.AsyncClient(timeout=30) as http_client:
                image_response = await http_client.get(body.imageUrl)
                image_response.raise_for_status()
            filename = body.imageUrl.rsplit("/", 1)[-1] or "image.png"
            raw = await gemini_client.generate_with_image(
                body.prompt, image_response.content, filename
            )
        else:
            raw = await gemini_client.generate_text(body.prompt)
    except (gemini_client.GeminiGatewayError, httpx.HTTPError) as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return GatewayResponse(raw=raw)
