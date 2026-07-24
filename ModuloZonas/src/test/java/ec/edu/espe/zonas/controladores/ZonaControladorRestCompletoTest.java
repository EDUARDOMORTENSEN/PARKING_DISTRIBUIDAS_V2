package ec.edu.espe.zonas.controladores;

import com.fasterxml.jackson.databind.ObjectMapper;
import ec.edu.espe.zonas.datos.dtos.ZonaRequestDTO;
import ec.edu.espe.zonas.dominio.entidades.Espacio;
import ec.edu.espe.zonas.dominio.entidades.EstadoEspacio;
import ec.edu.espe.zonas.dominio.entidades.TipoEspacio;
import ec.edu.espe.zonas.dominio.entidades.TipoZona;
import ec.edu.espe.zonas.dominio.entidades.Zona;
import ec.edu.espe.zonas.dominio.repositorios.EspacioRepositorio;
import ec.edu.espe.zonas.dominio.repositorios.ZonaRepositorio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@Transactional
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:postgresql://localhost:5433/test",
    "spring.datasource.driver-class-name=org.postgresql.Driver",
    "spring.datasource.username=postgres",
    "spring.datasource.password=12345",
    "spring.jpa.hibernate.ddl-auto=update",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect",
    "spring.jpa.properties.hibernate.type.preferred_enum_jdbc_type=INTEGER",
    "spring.rabbitmq.listener.simple.auto-startup=false"
})
class ZonaControladorRestCompletoTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ZonaRepositorio zonaRepositorio;

    @Autowired
    private EspacioRepositorio espacioRepositorio;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    private org.springframework.test.web.servlet.request.RequestPostProcessor jwtPermisos() {
        return jwt().authorities(
                new SimpleGrantedAuthority("ZONAS_CREATE"),
                new SimpleGrantedAuthority("ZONAS_READ"),
                new SimpleGrantedAuthority("ZONAS_UPDATE")
        );
    }

    // ==========================================
    // CREAR ZONA (CP1, CP1.1, CP2)
    // ==========================================

    @Test
    void testCrearZonaExitoso_CP1() throws Exception {
        ZonaRequestDTO request = ZonaRequestDTO.builder()
                .nombre("Zona Central")
                .descripcion("Parqueadero principal central")
                .tipo(TipoZona.REGULAR)
                .capacidad(30)
                .build();

        mockMvc.perform(post("/api/v1/zonas/")
                        .with(jwtPermisos())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.nombre", is("Zona Central")))
                .andExpect(jsonPath("$.codigo", startsWith("ZONA-REG.M-")))
                .andExpect(jsonPath("$.capacidad", is(30)))
                .andExpect(jsonPath("$.estado", is(1)));
    }

    @Test
    void testCrearZonaTipoMinusculas_CP1_1() throws Exception {
        ZonaRequestDTO request = ZonaRequestDTO.builder()
                .nombre("Zona Norte")
                .descripcion("Desc")
                .tipo(TipoZona.REGULAR)
                .capacidad(15)
                .build();

        mockMvc.perform(post("/api/v1/zonas/")
                        .with(jwtPermisos())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tipo", is("REGULAR")))
                .andExpect(jsonPath("$.codigo", startsWith("ZONA-REG.S-")));
    }

    @Test
    void testCrearZonaNombreInvalido_CP2_Subcaso1() throws Exception {
        ZonaRequestDTO request = ZonaRequestDTO.builder()
                .nombre("") // Inválido por @NotBlank
                .descripcion("Sin nombre")
                .tipo(TipoZona.REGULAR)
                .capacidad(25)
                .build();

        mockMvc.perform(post("/api/v1/zonas/")
                        .with(jwtPermisos())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testCrearZonaNombreDuplicado_CP2_Subcaso2() throws Exception {
        Zona zonaExistente = new Zona();
        zonaExistente.setNombre("Zona Sur");
        zonaExistente.setCodigo("ZONA-SUR.S-01");
        zonaExistente.setCapacidad(15);
        zonaExistente.setEstado(1);
        zonaExistente.setTipo(TipoZona.REGULAR);
        zonaExistente.setFechaCreacion(LocalDateTime.now());
        zonaRepositorio.save(zonaExistente);

        ZonaRequestDTO request = ZonaRequestDTO.builder()
                .nombre("Zona Sur") // Duplicado case-insensitive
                .descripcion("Duplicada")
                .tipo(TipoZona.REGULAR)
                .capacidad(20)
                .build();

        mockMvc.perform(post("/api/v1/zonas/")
                        .with(jwtPermisos())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void testCrearZonaTipoInvalido_CP2_Subcaso3() throws Exception {
        String jsonRequest = "{\"nombre\":\"Zona Este\",\"descripcion\":\"Desc\",\"tipo\":\"INVALIDO\",\"capacidad\":25}";

        mockMvc.perform(post("/api/v1/zonas/")
                        .with(jwtPermisos())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testCrearZonaCapacidadInvalida_CP2_Subcaso4() throws Exception {
        ZonaRequestDTO request = ZonaRequestDTO.builder()
                .nombre("Zona Oeste")
                .descripcion("Capacidad fuera de rango")
                .tipo(TipoZona.VIP)
                .capacidad(150) // Máximo es 100
                .build();

        mockMvc.perform(post("/api/v1/zonas/")
                        .with(jwtPermisos())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ==========================================
    // OBTENER ZONAS (CP1, CP2.1, CP3)
    // ==========================================

    @Test
    void testObtenerZonas_CP1() throws Exception {
        for (int i = 1; i <= 4; i++) {
            Zona z = new Zona();
            z.setNombre("Zona " + i);
            z.setCodigo("ZONA-REG.S-0" + i);
            z.setCapacidad(10);
            z.setEstado(1);
            z.setTipo(TipoZona.REGULAR);
            z.setFechaCreacion(LocalDateTime.now());
            zonaRepositorio.save(z);
        }

        mockMvc.perform(get("/api/v1/zonas/")
                        .with(jwtPermisos()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)));
    }

    @Test
    void testObtenerZonasDesocupadas_CP2_1() throws Exception {
        Zona z1 = new Zona();
        z1.setNombre("Zona Desocupada");
        z1.setCodigo("ZONA-REG.S-01");
        z1.setCapacidad(10);
        z1.setEstado(1);
        z1.setTipo(TipoZona.REGULAR);
        z1.setFechaCreacion(LocalDateTime.now());
        zonaRepositorio.save(z1);

        Espacio e1 = new Espacio();
        e1.setCodigo("ESP-01");
        e1.setZona(z1);
        e1.setEstado(EstadoEspacio.DISPONIBLE);
        e1.setActivo(true);
        e1.setTipo(TipoEspacio.AUTO);
        e1.setFechaCreacion(LocalDateTime.now());
        espacioRepositorio.save(e1);

        mockMvc.perform(get("/api/v1/zonas/desocupadas")
                        .with(jwtPermisos()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nombre", is("Zona Desocupada")));
    }

    @Test
    void testObtenerZonasPorTipo_CP3() throws Exception {
        Zona zReg = new Zona();
        zReg.setNombre("Zona Reg");
        zReg.setCodigo("ZONA-REG.M-01");
        zReg.setCapacidad(30);
        zReg.setEstado(1);
        zReg.setTipo(TipoZona.REGULAR);
        zReg.setFechaCreacion(LocalDateTime.now());
        zonaRepositorio.save(zReg);

        Zona zVip = new Zona();
        zVip.setNombre("Zona Vip");
        zVip.setCodigo("ZONA-VIP.M-02");
        zVip.setCapacidad(30);
        zVip.setEstado(1);
        zVip.setTipo(TipoZona.VIP);
        zVip.setFechaCreacion(LocalDateTime.now());
        zonaRepositorio.save(zVip);

        mockMvc.perform(get("/api/v1/zonas/tipo/VIP")
                        .with(jwtPermisos()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].tipo", is("VIP")));
    }

    // ==========================================
    // ACTUALIZAR ZONAS
    // ==========================================

    @Test
    void testActualizarZonaDescripcionInvalida_CP1_1() throws Exception {
        Zona z = new Zona();
        z.setNombre("Zona Test");
        z.setCodigo("ZONA-REG.S-01");
        z.setCapacidad(10);
        z.setEstado(1);
        z.setTipo(TipoZona.REGULAR);
        z.setFechaCreacion(LocalDateTime.now());
        zonaRepositorio.save(z);

        String descripcionLarga = "a".repeat(256); // Excede los 255 caracteres
        ZonaRequestDTO request = ZonaRequestDTO.builder()
                .nombre("Zona Test")
                .descripcion(descripcionLarga)
                .tipo(TipoZona.REGULAR)
                .capacidad(10)
                .build();

        mockMvc.perform(put("/api/v1/zonas/" + z.getId())
                        .with(jwtPermisos())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
