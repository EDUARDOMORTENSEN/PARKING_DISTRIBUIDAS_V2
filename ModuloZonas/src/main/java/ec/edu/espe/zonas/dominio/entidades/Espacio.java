package ec.edu.espe.zonas.dominio.entidades;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "espacios")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Espacio {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Código autogenerado en base a la zona y al número del espacio
     * Ej: Espacio-1A-ZONA-A1
     */
    @Column(unique = true, nullable = false, length = 12)
    private String codigo;

    @Column(length = 128)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoEspacio estado;


    @Column(nullable = false) //activo invactivo
    private boolean activo;//1 activo, 0 inactivo

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoEspacio tipo;

    @Column
    private LocalDateTime fechaCreacion;

    @Column
    private LocalDateTime fechaModificacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_zona")
    private Zona zona;
}
