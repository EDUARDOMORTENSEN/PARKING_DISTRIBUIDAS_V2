package ec.edu.espe.zonas.eventos;

import com.fasterxml.jackson.annotation.JsonProperty;
import ec.edu.espe.zonas.dominio.entidades.EstadoEspacio;
import ec.edu.espe.zonas.servicios.EspacioServicio;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
public class TicketEventListener {

    private static final Logger logger = LoggerFactory.getLogger(TicketEventListener.class);
    private final EspacioServicio espacioServicio;

    public TicketEventListener(EspacioServicio espacioServicio) {
        this.espacioServicio = espacioServicio;
    }

    public static class TicketEventPayload {
        @JsonProperty("id_espacio")
        private String idEspacio;
        private String estado;

        public String getIdEspacio() { return idEspacio; }
        public void setIdEspacio(String idEspacio) { this.idEspacio = idEspacio; }

        public String getEstado() { return estado; }
        public void setEstado(String estado) { this.estado = estado; }
    }

    @RabbitListener(queues = "${app.rabbitmq.queue}")
    public void handleTicketEvent(TicketEventPayload payload) {
        try {
            UUID idEspacio = UUID.fromString(payload.getIdEspacio());
            EstadoEspacio nuevoEstado = EstadoEspacio.valueOf(payload.getEstado().toUpperCase());
            
            logger.info("Recibido evento de ticket para espacio {}. Nuevo estado: {}", idEspacio, nuevoEstado);
            espacioServicio.actualizarEstado(idEspacio, nuevoEstado);
            logger.info("Estado del espacio {} actualizado exitosamente", idEspacio);
        } catch (IllegalArgumentException e) {
            logger.error("Error al parsear payload del evento: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("Error al actualizar el estado del espacio: {}", e.getMessage());
        }
    }
}
