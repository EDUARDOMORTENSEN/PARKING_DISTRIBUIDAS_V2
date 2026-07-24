package ec.edu.espe.zonas.controladores;

import com.fasterxml.jackson.databind.ObjectMapper;
import ec.edu.espe.zonas.datos.dtos.ZonaRequestDTO;
import ec.edu.espe.zonas.dominio.entidades.TipoZona;
import ec.edu.espe.zonas.dominio.entidades.Zona;
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
class ZonaControladorRestTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ZonaRepositorio zonaRepositorio;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @Test
    void testCrearZonaExitoso() throws Exception {
        ZonaRequestDTO request = ZonaRequestDTO.builder()
                .nombre("Zona Norte")
                .descripcion("Parqueadero principal norte")
                .tipo(TipoZona.REGULAR)
                .capacidad(30)
                .build();

        mockMvc.perform(post("/api/v1/zonas/")
                        .with(jwt().authorities(
                                new SimpleGrantedAuthority("ZONAS_CREATE"),
                                new SimpleGrantedAuthority("ZONAS_READ")
                        ))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.nombre", is("Zona Norte")))
                .andExpect(jsonPath("$.codigo", startsWith("ZONA-REG.M-")))
                .andExpect(jsonPath("$.capacidad", is(30)))
                .andExpect(jsonPath("$.estado", is(1)));
    }

    @Test
    void testCrearZonaNombreInvalido() throws Exception {
        ZonaRequestDTO request = ZonaRequestDTO.builder()
                .nombre("") // Inválido por @NotBlank
                .descripcion("Descripción")
                .tipo(TipoZona.REGULAR)
                .capacidad(25)
                .build();

        mockMvc.perform(post("/api/v1/zonas/")
                        .with(jwt().authorities(
                                new SimpleGrantedAuthority("ZONAS_CREATE"),
                                new SimpleGrantedAuthority("ZONAS_READ")
                        ))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores", notNullValue()));
    }

    @Test
    void testCrearZonaNombreDuplicado() throws Exception {
        Zona zonaExistente = new Zona();
        zonaExistente.setNombre("Zona Sur");
        zonaExistente.setCodigo("ZONA-SUR.S-01");
        zonaExistente.setCapacidad(15);
        zonaExistente.setEstado(1);
        zonaExistente.setTipo(TipoZona.REGULAR);
        zonaExistente.setFechaCreacion(LocalDateTime.now());
        zonaRepositorio.save(zonaExistente);

        ZonaRequestDTO request = ZonaRequestDTO.builder()
                .nombre("Zona Sur") // Duplicado (case-insensitive)
                .descripcion("Otra zona sur")
                .tipo(TipoZona.REGULAR)
                .capacidad(20)
                .build();

        mockMvc.perform(post("/api/v1/zonas/")
                        .with(jwt().authorities(
                                new SimpleGrantedAuthority("ZONAS_CREATE"),
                                new SimpleGrantedAuthority("ZONAS_READ")
                        ))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void testCrearZonaCapacidadInvalida() throws Exception {
        ZonaRequestDTO request = ZonaRequestDTO.builder()
                .nombre("Zona Este")
                .descripcion("Capacidad fuera de rango")
                .tipo(TipoZona.VIP)
                .capacidad(150) // Máximo es 100
                .build();

        mockMvc.perform(post("/api/v1/zonas/")
                        .with(jwt().authorities(
                                new SimpleGrantedAuthority("ZONAS_CREATE"),
                                new SimpleGrantedAuthority("ZONAS_READ")
                        ))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testObtenerZonas() throws Exception {
        Zona z1 = new Zona();
        z1.setNombre("Zona A");
        z1.setCodigo("ZONA-REG.S-01");
        z1.setCapacidad(10);
        z1.setEstado(1);
        z1.setTipo(TipoZona.REGULAR);
        z1.setFechaCreacion(LocalDateTime.now());
        zonaRepositorio.save(z1);

        mockMvc.perform(get("/api/v1/zonas/")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ZONAS_READ"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nombre", is("Zona A")));
    }

    @Test
    void testObtenerZonasPorTipo() throws Exception {
        Zona zVip = new Zona();
        zVip.setNombre("Zona VIP");
        zVip.setCodigo("ZONA-VIP.M-01");
        zVip.setCapacidad(30);
        zVip.setEstado(1);
        zVip.setTipo(TipoZona.VIP);
        zVip.setFechaCreacion(LocalDateTime.now());
        zonaRepositorio.save(zVip);

        mockMvc.perform(get("/api/v1/zonas/tipo/VIP")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ZONAS_READ"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].tipo", is("VIP")));
    }

    @Test
    void testActivarDesactivarZonaNoEncontrada() throws Exception {
        mockMvc.perform(patch("/api/v1/zonas/123e4567-e89b-12d3-a456-426614174099")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ZONAS_UPDATE"))))
                .andExpect(status().isNoContent());
    }
}
