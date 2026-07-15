import asyncio
import json

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from app.sse.sse_service import sse_service

router = APIRouter(prefix="/sse", tags=["SSE"])


async def _event_stream(request: Request):
    queue = sse_service.subscribe()
    try:
        while True:
            if await request.is_disconnected():
                break
            try:
                event = await asyncio.wait_for(queue.get(), timeout=15)
                yield (
                    f"event: {event['type']}\n"
                    f"data: {json.dumps(event['data'])}\n\n"
                )
            except asyncio.TimeoutError:
                # Comentario SSE para mantener viva la conexión (evita timeouts de proxies)
                yield ": keep-alive\n\n"
    finally:
        sse_service.unsubscribe(queue)


@router.get("/espacios")
async def stream_espacios(request: Request):
    return StreamingResponse(
        _event_stream(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
