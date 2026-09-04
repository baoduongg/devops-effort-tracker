import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

import gemini_client
from routes import answer_query, format_entry

logger = logging.getLogger("ai-gateway")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await gemini_client.start_client()
    except gemini_client.GeminiGatewayError as exc:
        logger.error(
            "Gemini authentication failed at startup: %s. The server will "
            "still start, but /format-entry and /answer-query will return "
            "502 until this is resolved and the service is restarted.",
            exc,
        )
    yield


app = FastAPI(title="ai-gateway", lifespan=lifespan)

app.include_router(format_entry.router)
app.include_router(answer_query.router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
