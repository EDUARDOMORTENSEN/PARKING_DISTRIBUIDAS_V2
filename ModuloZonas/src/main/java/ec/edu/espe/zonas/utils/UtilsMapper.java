package ec.edu.espe.zonas.utils;

import ec.edu.espe.zonas.datos.dtos.EspacioRequestDTO;
import ec.edu.espe.zonas.datos.dtos.EspacioResponseDTO;
import ec.edu.espe.zonas.datos.dtos.ZonaResponseDTO;
import ec.edu.espe.zonas.dominio.entidades.Espacio;
import ec.edu.espe.zonas.dominio.entidades.Zona;
import org.springframework.stereotype.Component;

@Component
public class UtilsMapper {

    public EspacioResponseDTO toEspacioResponseDto(Espacio objEspacio) {
        if (objEspacio == null) return null;
        return EspacioResponseDTO.builder()
                .id(objEspacio.getId())
                .codigo(objEspacio.getCodigo())
                .tipo(objEspacio.getTipo())
                .descripcion(objEspacio.getDescripcion())
                .activo(objEspacio.isActivo())
                .estado(objEspacio.getEstado())
                .idZona(objEspacio.getZona().getId())
                .nombreZona(objEspacio.getZona().getNombre())
                .fechaCreacion(objEspacio.getFechaCreacion())
                .fechaModificacion(objEspacio.getFechaModificacion())
                .build();
    }

    public Espacio toEntityEspacios(EspacioRequestDTO requestDto){
        if( requestDto == null) return null;

        return Espacio.builder()
                .descripcion(requestDto.getDescripcion())
                .tipo(requestDto.getTipo())
                .estado(requestDto.getEstado())
                .build();
    }

    public ZonaResponseDTO toZonaResponseDto(Zona objZona) {
        if (objZona == null) return null;
        return ZonaResponseDTO.builder()
                .id(objZona.getId())
                .nombre(objZona.getNombre())
                .descripcion(objZona.getDescripcion())
                .capacidad(objZona.getCapacidad())
                .codigo(objZona.getCodigo())
                .tipo(objZona.getTipo())
                .espacios(objZona.getEspacios() != null ? objZona.getEspacios().stream().map(this::toEspacioResponseDto).collect(java.util.stream.Collectors.toList()) : null)
                .estado(objZona.getEstado())
                .fechaCreacion(objZona.getFechaCreacion())
                .fechaModificacion(objZona.getFechaModificacion())
                .build();
    }
}
