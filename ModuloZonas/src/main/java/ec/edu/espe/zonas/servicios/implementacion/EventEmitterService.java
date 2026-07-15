package ec.edu.espe.zonas.servicios.implementacion;

import ec.edu.espe.zonas.infrastructure.messaging.RabbitMQConfig;
import ec.edu.espe.zonas.datos.dtos.EventoAuditoria;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;


@Service
public class EventEmitterService {

    private final RabbitTemplate rabbitTemplate;
    private final RabbitMQConfig config;

    public EventEmitterService(RabbitTemplate rabbitTemplate, RabbitMQConfig config) {
        this.rabbitTemplate = rabbitTemplate;
        this.config = config;
    }

    public void enviarEventoAuditoria(EventoAuditoria evento) {
        try{
        String exchangeName = config.getAuditExchangeName();
        String routingKey = config.getAuditRoutingKey();
        rabbitTemplate.convertAndSend(
            exchangeName,
            routingKey,
            evento
        );
        System.out.println("Mensaje JSON enviado a RabbitMQ: " + evento.toString());
        } catch (Exception e) {
            System.err.println("Error al enviar el mensaje a RabbitMQ: " + e.getMessage());
            e.printStackTrace();
        }
    }
}