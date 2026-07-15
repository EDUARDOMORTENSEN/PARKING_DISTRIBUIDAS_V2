import asyncio
import logging
from typing import Any

logger = logging.getLogger(__name__)


class SseService:
    """Equivalente al SseService de Nest (Subject + asObservable), pero
    implementado con asyncio: cada suscriptor tiene su propia cola y
    'emitEvent' hace fan-out del evento a todas las colas activas."""

    def __init__(self):
        self._subscribers: set[asyncio.Queue] = set()

    def subscribe(self) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue()
        self._subscribers.add(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue) -> None:
        self._subscribers.discard(queue)

    async def emit_event(self, event_type: str, data: Any) -> None:
        logger.info(f"Emitiendo evento SSE: {event_type}")
        event = {"type": event_type, "data": data}
        for queue in list(self._subscribers):
            await queue.put(event)


sse_service = SseService()
