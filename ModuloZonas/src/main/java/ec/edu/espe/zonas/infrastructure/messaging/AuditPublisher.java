package ec.edu.espe.zonas.infrastructure.messaging;

import ec.edu.espe.zonas.datos.dtos.EventoAuditoria;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuditPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final RabbitMQConfig rabbitMQConfig;

    @Autowired
    public AuditPublisher(RabbitTemplate rabbitTemplate, RabbitMQConfig rabbitMQConfig) {
        this.rabbitTemplate = rabbitTemplate;
        this.rabbitMQConfig = rabbitMQConfig;
    }

    public void publishAuditEvent(EventoAuditoria evento) {
        try {
            rabbitTemplate.convertAndSend(
                rabbitMQConfig.getAuditExchangeName(),
                rabbitMQConfig.getAuditRoutingKey(),
                evento
            );
        } catch (Exception e) {
            // No bloquea la operación principal si la auditoría falla
            System.err.println("Error publicando evento de auditoría: " + e.getMessage());
        }
    }
}
