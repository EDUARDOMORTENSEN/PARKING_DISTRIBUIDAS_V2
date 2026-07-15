package ec.edu.espe.zonas.datos.dtos;

import ec.edu.espe.zonas.dominio.entidades.TipoZona;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Objeto de transferencia de datos para la creación y actualización de una zona")
public class ZonaRequestDTO {
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 32, min = 1, message = "El nombre de la zona debe tener entre 1 y 32 caracteres.")
    @Pattern(regexp = "^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9\\s-]+$", message = "El nombre solo puede contener letras, números, espacios y guiones")
    @Schema(description = "Nombre de la zona", example = "Zona Norte", requiredMode = Schema.RequiredMode.REQUIRED)
    private String nombre;

    @Size(max = 255, message = "La descripción no puede superar los 255 caracteres")
    @Schema(description = "Descripción detallada de la zona", example = "Parqueadero exclusivo para profesores", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private String descripcion;

    @NotNull(message = "El tipo de zona es obligatorio")
    @Schema(description = "Tipo de zona", example = "DOCENTES", requiredMode = Schema.RequiredMode.REQUIRED)
    private TipoZona tipo;

    @NotNull(message = "La capacidad es obligatoria")
    @Min(1)
    @Max(100)
    @Schema(description = "Capacidad máxima de vehículos en la zona", example = "50", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer capacidad;

}
