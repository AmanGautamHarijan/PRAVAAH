"""WebSocket endpoint for live flood-monitoring events."""

import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websocket.manager import manager


logger = logging.getLogger(__name__)
router = APIRouter(tags=["live events"])


@router.websocket("/ws/live")
async def live_sensor_events(websocket: WebSocket) -> None:
    """Stream simulator sensor and prediction updates until disconnect."""
    await manager.connect(websocket)
    try:
        while True:
            await websocket.send_json(await manager.receive(websocket))
    except WebSocketDisconnect:
        logger.info("Live WebSocket client closed the connection")
    finally:
        manager.disconnect(websocket)