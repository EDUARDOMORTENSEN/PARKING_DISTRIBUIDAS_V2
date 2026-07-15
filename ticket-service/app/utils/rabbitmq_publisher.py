import json
import logging
from aio_pika import connect_robust, Message, DeliveryMode

from app.core.config import settings

logger = logging.getLogger(__name__)

class RabbitMQPublisher:
    def __init__(self):
        self.connection = None
        self.channel = None

    async def connect(self):
        if self.connection is None or self.connection.is_closed:
            url = f"amqp://{settings.RABBITMQ_USER}:{settings.RABBITMQ_PASSWORD}@{settings.RABBITMQ_HOST}:{settings.RABBITMQ_PORT}/"
            try:
                self.connection = await connect_robust(url)
                self.channel = await self.connection.channel()
                logger.info(f"Conectado a RabbitMQ en {settings.RABBITMQ_HOST}:{settings.RABBITMQ_PORT}")
            except Exception as e:
                logger.error(f"Fallo al conectar a RabbitMQ: {e}")

    async def publish_ticket_event(self, event_type: str, payload: dict):
        if not self.channel or self.channel.is_closed:
            await self.connect()

        if self.channel:
            exchange = await self.channel.declare_exchange(
                settings.RABBITMQ_EXCHANGE, type='topic', durable=True
            )
            
            message_body = json.dumps(payload).encode()
            
            routing_key = f"{settings.RABBITMQ_ROUTING_KEY.replace('.#', '')}.{event_type}"
            
            message = Message(
                message_body,
                delivery_mode=DeliveryMode.PERSISTENT
            )
            
            try:
                await exchange.publish(message, routing_key=routing_key)
                logger.info(f"Evento {event_type} publicado en RabbitMQ con payload: {payload}")
            except Exception as e:
                logger.error(f"Fallo al publicar el evento en RabbitMQ: {e}")
        else:
            logger.error("No se pudo publicar el mensaje, el canal de RabbitMQ no está disponible.")

    async def publish_audit_event(self, payload: dict):
        if not self.channel or self.channel.is_closed:
            await self.connect()

        if self.channel:
            exchange_name = settings.AUDIT_EXCHANGE
            routing_key = settings.AUDIT_ROUTING_KEY
            
            exchange = await self.channel.declare_exchange(
                exchange_name, type='topic', durable=True
            )
            
            message_body = json.dumps(payload).encode()
            message = Message(
                message_body,
                delivery_mode=DeliveryMode.PERSISTENT
            )
            
            try:
                await exchange.publish(message, routing_key=routing_key)
                logger.debug(f"Evento de auditoría publicado en {exchange_name}: {payload}")
            except Exception as e:
                logger.error(f"Fallo al publicar el evento de auditoría: {e}")
        else:
            logger.error("No se pudo publicar auditoría, canal RabbitMQ no disponible.")

rabbitmq_publisher = RabbitMQPublisher()
