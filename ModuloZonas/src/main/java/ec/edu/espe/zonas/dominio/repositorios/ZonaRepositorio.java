package ec.edu.espe.zonas.dominio.repositorios;

import ec.edu.espe.zonas.dominio.entidades.Zona;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.List;

public interface ZonaRepositorio extends JpaRepository<Zona, UUID> {
    boolean existsByCodigo(String codigo);
    boolean existsByDescripcion(String descripcion);
    boolean existsByNombreIgnoreCase(String nombre);
    List<Zona> findByTipo(ec.edu.espe.zonas.dominio.entidades.TipoZona tipo);
}
