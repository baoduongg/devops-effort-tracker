from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class AnswerQueryRequest(BaseModel):
    prompt: str


class GatewayResponse(BaseModel):
    raw: str


@router.post("/answer-query", response_model=GatewayResponse)
async def answer_query(body: AnswerQueryRequest) -> GatewayResponse:
    return GatewayResponse(raw="stub response")
