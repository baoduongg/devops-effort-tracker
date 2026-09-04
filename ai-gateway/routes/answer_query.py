from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import gemini_client

router = APIRouter()


class AnswerQueryRequest(BaseModel):
    prompt: str


class GatewayResponse(BaseModel):
    raw: str


@router.post("/answer-query", response_model=GatewayResponse)
async def answer_query(body: AnswerQueryRequest) -> GatewayResponse:
    try:
        raw = await gemini_client.generate_text(body.prompt)
    except gemini_client.GeminiGatewayError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return GatewayResponse(raw=raw)
