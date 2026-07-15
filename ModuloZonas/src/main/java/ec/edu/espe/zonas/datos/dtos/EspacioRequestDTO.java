package ec.edu.espe.zonas.datos.dtos;
import ec.edu.espe.zonas.dominio.entidades.EstadoEspacio;
import ec.edu.espe.zonas.dominio.entidades.TipoEspacio;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Objeto de transferencia de datos para la creación y actualización de un espacio")
public class EspacioRequestDTO {

    @NotNull(message = "El id de la zona es obligatorio")
    @Schema(description = "Identificador único de la zona a la que pertenece el espacio", example = "123e4567-e89b-12d3-a456-426614174000", requiredMode = Schema.RequiredMode.REQUIRED)
    private UUID idZona;

    @Size(max = 128, message = "La descripción no puede superar los 128 caracteres")
    @Schema(description = "Descripción del espacio", example = "Espacio para discapacitados", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private String descripcion;

    @NotNull(message = "El tipo de espacio es obligatorio")
    @Schema(description = "Tipo de vehículo que puede usar el espacio", example = "AUTO", requiredMode = Schema.RequiredMode.REQUIRED)
    private TipoEspacio tipo;

    // Estado es opcional en creación — default DISPONIBLE se asigna en el servicio
    @Schema(description = "Estado del espacio (opcional en creación)", example = "DISPONIBLE", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private EstadoEspacio estado;

}
