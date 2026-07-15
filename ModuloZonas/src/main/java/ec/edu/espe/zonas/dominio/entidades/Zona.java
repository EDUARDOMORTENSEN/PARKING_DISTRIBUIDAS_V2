package ec.edu.espe.zonas.dominio.entidades;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "zonas")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Zona {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 100)
    private String nombre;

    @Column(unique = true, nullable = false, length = 15)
    private String codigo;

    @Column(nullable = false)
    private int capacidad;

    @Column
    private String descripcion;

    @Column
    private int estado; //1 activo, 0 inactivo

    @Enumerated
    @Column(nullable = false)
    private TipoZona tipo;

    @Column
    private LocalDateTime fechaCreacion;

    @Column
    private LocalDateTime fechaModificacion;

    @OneToMany(mappedBy = "zona", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Espacio> espacios = new ArrayList<>();

}
