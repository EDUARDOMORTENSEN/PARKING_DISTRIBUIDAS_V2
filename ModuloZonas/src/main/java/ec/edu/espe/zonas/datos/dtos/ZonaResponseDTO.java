package ec.edu.espe.zonas.datos.dtos;

import ec.edu.espe.zonas.dominio.entidades.TipoZona;
import ec.edu.espe.zonas.dominio.entidades.Espacio;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Objeto de respuesta con los datos de una zona")
public class ZonaResponseDTO {
    @Schema(description = "Identificador único de la zona", example = "123e4567-e89b-12d3-a456-426614174000", requiredMode = Schema.RequiredMode.REQUIRED)
    private UUID id;
    @Schema(description = "Nombre de la zona", example = "Zona Norte", requiredMode = Schema.RequiredMode.REQUIRED)
    private String nombre;
    @Schema(description = "Capacidad máxima de la zona", example = "50", requiredMode = Schema.RequiredMode.REQUIRED)
    private int capacidad;
    @Schema(description = "Código único de la zona", example = "ZON-NOR-001", requiredMode = Schema.RequiredMode.REQUIRED)
    private String codigo;
    @Schema(description = "Descripción de la zona", example = "Parqueadero exclusivo para profesores", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private String descripcion;
    @Schema(description = "Estado lógico de la zona", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private int estado;
    @Schema(description = "Tipo de zona", example = "REGULAR", requiredMode = Schema.RequiredMode.REQUIRED)
    private TipoZona tipo;
    @Schema(description = "Fecha de creación del registro", example = "2024-01-01T12:00:00", requiredMode = Schema.RequiredMode.REQUIRED)
    private LocalDateTime fechaCreacion;
    @Schema(description = "Fecha de última modificación del registro", example = "2024-01-02T15:30:00", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private LocalDateTime fechaModificacion;
    @Schema(description = "Lista de espacios pertenecientes a la zona", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private List<EspacioResponseDTO> espacios;
}
