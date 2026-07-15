package ec.edu.espe.zonas.datos.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventoAuditoria {
    @NotNull(message = "El servicio es obligatorio")
    private String servicio;

    @NotNull(message = "La acción es obligatoria")
    private String accion;

    private String usuario;

    @NotNull(message = "La entidad manipulada es obligatoria")
    private String entidad;

    private String idEntidad;

    private Object datos;

    private String ip;
    private String mac;
    private String rol;
}