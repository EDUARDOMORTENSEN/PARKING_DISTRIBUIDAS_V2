package ec.edu.espe.zonas.datos.dtos;

import ec.edu.espe.zonas.dominio.entidades.EstadoEspacio;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Objeto de transferencia de datos para buscar espacios por zona y estado")
public class BusquedaZonaEstadoDTO {
    @NotNull(message = "El id de la zona es obligatorio")
    @Schema(description = "Identificador único de la zona", example = "123e4567-e89b-12d3-a456-426614174000", requiredMode = Schema.RequiredMode.REQUIRED)
    private UUID idZona;

    @NotNull(message = "El estado es obligatorio")
    @Schema(description = "Estado del espacio de parqueo", example = "DISPONIBLE", requiredMode = Schema.RequiredMode.REQUIRED)
    private EstadoEspacio estado;
}
