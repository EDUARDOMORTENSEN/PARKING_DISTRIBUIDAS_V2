package ec.edu.espe.zonas.datos.dtos;

import ec.edu.espe.zonas.dominio.entidades.EstadoEspacio;
import ec.edu.espe.zonas.dominio.entidades.TipoEspacio;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Objeto de respuesta con los datos de un espacio de parqueo")
public class EspacioResponseDTO {
    @Schema(description = "Identificador único del espacio", example = "123e4567-e89b-12d3-a456-426614174000", requiredMode = Schema.RequiredMode.REQUIRED)
    private UUID id;

    @Schema(description = "Código único del espacio", example = "ESP-001", requiredMode = Schema.RequiredMode.REQUIRED)
    private String codigo;

    @Schema(description = "Tipo de vehículo que puede usar el espacio", example = "AUTO", requiredMode = Schema.RequiredMode.REQUIRED)
    private TipoEspacio tipo; // moto, auto, buseta

    @Schema(description = "Descripción del espacio", example = "Espacio para discapacitados", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private String descripcion;

    @Schema(description = "Estado actual del espacio", example = "DISPONIBLE", requiredMode = Schema.RequiredMode.REQUIRED)
    private EstadoEspacio estado;

    @Schema(description = "Indica si el espacio está activo", example = "true", requiredMode = Schema.RequiredMode.REQUIRED)
    private boolean activo;

    @Schema(description = "Identificador de la zona a la que pertenece", example = "123e4567-e89b-12d3-a456-426614174001", requiredMode = Schema.RequiredMode.REQUIRED)
    private UUID idZona;

    @Schema(description = "Nombre de la zona a la que pertenece", example = "Zona Norte", requiredMode = Schema.RequiredMode.REQUIRED)
    private String nombreZona;

    @Column
    @Schema(description = "Fecha de creación del registro", example = "2024-01-01T12:00:00", requiredMode = Schema.RequiredMode.REQUIRED)
    private LocalDateTime fechaCreacion;

    @Column
    @Schema(description = "Fecha de última modificación del registro", example = "2024-01-02T15:30:00", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private LocalDateTime fechaModificacion;
}
