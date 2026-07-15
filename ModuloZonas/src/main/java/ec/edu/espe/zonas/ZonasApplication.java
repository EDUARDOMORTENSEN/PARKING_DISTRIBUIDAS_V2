package ec.edu.espe.zonas;

import ec.edu.espe.zonas.datos.dtos.ZonaRequestDTO;
import ec.edu.espe.zonas.dominio.entidades.TipoZona;
import ec.edu.espe.zonas.servicios.ZonaServicio;
import ec.edu.espe.zonas.utils.UtilsMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;

@OpenAPIDefinition(info = @Info(title = "Zonas API", version = "v1"))
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    scheme = "bearer"
)
@SpringBootApplication
public class ZonasApplication {

    public static void main(String[] args) {
        ApplicationContext context = SpringApplication.run(ZonasApplication.class, args);


    }

}
