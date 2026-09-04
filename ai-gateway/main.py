from fastapi import FastAPI

from routes import answer_query, format_entry

app = FastAPI(title="ai-gateway")

app.include_router(format_entry.router)
app.include_router(answer_query.router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
