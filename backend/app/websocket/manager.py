"""Connection management and delivery for live sensor WebSocket clients."""

import asyncio
import logging
from collections.abc import Mapping
from typing import Any

from fastapi import WebSocket


logger = logging.getLogger(__name__)


class ConnectionManager:
    """Track clients and safely queue JSON-compatible messages for each one."""

    def __init__(self) -> None:
        self._connections: dict[WebSocket, asyncio.Queue[Mapping[str, Any]]] = {}
        self._loop: asyncio.AbstractEventLoop | None = None

    async def connect(self, websocket: WebSocket) -> None:
        """Accept and register one client connection."""
        await websocket.accept()
        self._loop = asyncio.get_running_loop()
        self._connections[websocket] = asyncio.Queue()
        logger.info("WebSocket client connected; active_clients=%d", len(self._connections))

    def disconnect(self, websocket: WebSocket) -> None:
        """Remove a client without failing if it already disconnected."""
        self._connections.pop(websocket, None)
        logger.info("WebSocket client disconnected; active_clients=%d", len(self._connections))

    async def receive(self, websocket: WebSocket) -> Mapping[str, Any]:
        """Wait for the next queued message for a connected client."""
        return await self._connections[websocket].get()

    async def broadcast(self, message: Mapping[str, Any]) -> None:
        """Queue a message for every currently connected client."""
        for queue in tuple(self._connections.values()):
            await queue.put(message)

    def publish_from_thread(self, message: Mapping[str, Any]) -> None:
        """Schedule a broadcast from the simulator worker thread."""
        if self._loop is None or self._loop.is_closed():
            logger.debug("No active WebSocket event loop; dropping live message")
            return
        self._loop.call_soon_threadsafe(asyncio.create_task, self.broadcast(message))


manager = ConnectionManager()