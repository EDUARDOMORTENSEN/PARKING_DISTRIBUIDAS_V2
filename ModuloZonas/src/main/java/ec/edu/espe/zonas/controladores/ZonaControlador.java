package ec.edu.espe.zonas.controladores;
import ec.edu.espe.zonas.datos.dtos.ZonaRequestDTO;
import ec.edu.espe.zonas.datos.dtos.ZonaResponseDTO;
import ec.edu.espe.zonas.dominio.entidades.TipoZona;
import ec.edu.espe.zonas.servicios.ZonaServicio;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;  
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1/zonas")
@RequiredArgsConstructor //Instancia las variables que se instancien como final
//Si no tiene uri en post mapping apunta a la ruta general del controlador
@Tag(name = "Zonas", description = "Operaciones relacionadas con las zonas de parqueo")
@SecurityRequirement(name = "bearerAuth")
public class ZonaControlador {
    private final ZonaServicio servicio;

    @Operation(summary = "Obtener todas las zonas", description = "Retorna una lista de todas las zonas registradas")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de zonas obtenida exitosamente")
    })
    @GetMapping("/")
    @PreAuthorize("hasAuthority('ZONAS_READ')")
    public ResponseEntity<List<ZonaResponseDTO>> getZonas()
    {
        return ResponseEntity.ok(servicio.listarZonas());//200 si es exitoso, 500 si falla
    }

    @Operation(summary = "Obtener zonas desocupadas", description = "Retorna una lista de zonas que tienen espacios disponibles")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de zonas obtenida exitosamente")
    })
    @GetMapping("/desocupadas")
    @PreAuthorize("hasAuthority('ZONAS_READ')")
    public ResponseEntity<List<ZonaResponseDTO>> getZonasDesocupadas() {
        return ResponseEntity.ok(servicio.listarZonasDesocupadas());
    }

    @Operation(summary = "Obtener zonas por tipo", description = "Retorna una lista de zonas filtradas por su tipo")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de zonas obtenida exitosamente"),
            @ApiResponse(responseCode = "400", description = "Tipo de zona inválido")
    })
    @GetMapping("/tipo/{tipo}")
    @PreAuthorize("hasAuthority('ZONAS_READ')")
    public ResponseEntity<List<ZonaResponseDTO>> getZonasPorTipo(@PathVariable TipoZona tipo) {
        return ResponseEntity.ok(servicio.listarZonasPorTipo(tipo));
    }

    @Operation(summary = "Crear nueva zona", description = "Crea una nueva zona con los datos proporcionados")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Zona creada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos")
    })
    @PostMapping("/")
    @PreAuthorize("hasAuthority('ZONAS_CREATE')")
    public ResponseEntity<ZonaResponseDTO> crearZona(@Valid @RequestBody ZonaRequestDTO request){
        //ZonaResponseDTO res = servicio.crearZona(request);
        // return new ResponseEntity<>(res, HttpStatus.CREATED);
        return new ResponseEntity<>(servicio.crearZona(request),HttpStatus.CREATED);
    }

    @Operation(summary = "Actualizar zona", description = "Actualiza los datos de una zona existente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Zona actualizada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
            @ApiResponse(responseCode = "404", description = "Zona no encontrada")
    })
    @PutMapping("/{idZona}") //Los params se extraen con PathVariable
    @PreAuthorize("hasAuthority('ZONAS_UPDATE')")
    public ResponseEntity<ZonaResponseDTO> actualizarZona(@PathVariable UUID idZona, @Valid @RequestBody ZonaRequestDTO request){
        //ZonaResponseDTO res = servicio.crearZona(request);
        // return new ResponseEntity<>(res, HttpStatus.CREATED);
        return ResponseEntity.ok(servicio.actualizarZona(idZona, request));
    }

    @Operation(summary = "Activar/Desactivar zona", description = "Cambia el estado de una zona entre activa e inactiva")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Estado cambiado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Zona no encontrada")
    })
    @PatchMapping("/{idZona}")
    @PreAuthorize("hasAuthority('ZONAS_UPDATE')")
    public ResponseEntity<Void> activarDesactivarZona(@PathVariable UUID idZona)
    {
        servicio.activarDesactivar(idZona);
        return ResponseEntity.noContent().build();
    }

}
