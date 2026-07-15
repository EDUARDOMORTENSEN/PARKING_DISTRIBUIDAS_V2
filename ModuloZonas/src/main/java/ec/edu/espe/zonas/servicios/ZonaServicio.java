package ec.edu.espe.zonas.servicios;

import ec.edu.espe.zonas.datos.dtos.ZonaRequestDTO;
import ec.edu.espe.zonas.datos.dtos.ZonaResponseDTO;

import java.util.List;
import java.util.UUID;

public interface ZonaServicio {
    List<ZonaResponseDTO> listarZonas();
    List<ZonaResponseDTO> listarZonasDesocupadas();
    List<ZonaResponseDTO> listarZonasPorTipo(ec.edu.espe.zonas.dominio.entidades.TipoZona tipo);

    ZonaResponseDTO crearZona(ZonaRequestDTO request);

    ZonaResponseDTO actualizarZona(UUID idZona, ZonaRequestDTO request);

    void activarDesactivar(UUID idZona);
}
