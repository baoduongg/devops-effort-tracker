import tempfile
from pathlib import Path

from gemini_webapi import GeminiClient

_client: GeminiClient | None = None


class GeminiGatewayError(Exception):
    """Raised when the underlying Gemini call fails for any reason."""


async def start_client() -> None:
    global _client
    _client = GeminiClient()
    try:
        await _client.init(timeout=30, auto_refresh=True)
    except Exception as exc:
        raise GeminiGatewayError(
            f"Failed to authenticate with Gemini: {exc}. "
            "Make sure this machine has a browser logged into "
            "gemini.google.com."
        ) from exc


def get_client() -> GeminiClient:
    if _client is None:
        raise GeminiGatewayError("Gemini client is not initialized yet.")
    return _client


async def generate_text(prompt: str) -> str:
    try:
        response = await get_client().generate_content(prompt)
    except Exception as exc:
        raise GeminiGatewayError(f"Gemini request failed: {exc}") from exc
    return response.text


async def generate_with_image(prompt: str, image_bytes: bytes, filename: str) -> str:
    suffix = Path(filename).suffix or ".png"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(image_bytes)
        tmp_path = Path(tmp.name)

    try:
        response = await get_client().generate_content(prompt, files=[tmp_path])
    except Exception as exc:
        raise GeminiGatewayError(f"Gemini request failed: {exc}") from exc
    finally:
        tmp_path.unlink(missing_ok=True)

    return response.text
