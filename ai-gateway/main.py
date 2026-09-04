from contextlib import asynccontextmanager

from fastapi import FastAPI

import gemini_client
from routes import answer_query, format_entry


@asynccontextmanager
async def lifespan(app: FastAPI):
    await gemini_client.start_client()
    yield


app = FastAPI(title="ai-gateway", lifespan=lifespan)

app.include_router(format_entry.router)
app.include_router(answer_query.router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
