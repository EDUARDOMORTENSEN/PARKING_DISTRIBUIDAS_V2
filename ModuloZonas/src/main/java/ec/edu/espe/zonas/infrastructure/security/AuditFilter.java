package ec.edu.espe.zonas.infrastructure.security;

import ec.edu.espe.zonas.datos.dtos.EventoAuditoria;
import ec.edu.espe.zonas.infrastructure.messaging.AuditPublisher;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;


import java.io.IOException;
import java.util.List;

@Component
public class AuditFilter extends OncePerRequestFilter {

    @Autowired
    private AuditPublisher auditPublisher;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String method = request.getMethod();
        
        // Solo auditar métodos que mutan estado
        if (!method.equals("POST") && !method.equals("PUT") && !method.equals("PATCH") && !method.equals("DELETE")) {
            filterChain.doFilter(request, response);
            return;
        }

        filterChain.doFilter(request, response);

        if (response.getStatus() < 400) {
            String accion = mapMethodToAction(method);
            String ip = extractIp(request);
            String mac = request.getHeader("X-MAC-Address");
            if (mac == null || mac.isEmpty()) {
                mac = "00:00:00:00:00:00";
            }

            String usuario = "system";
            String rol = "system";

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
                usuario = jwt.getClaimAsString("username");
                if (usuario == null) usuario = jwt.getSubject();
                List<String> roles = jwt.getClaimAsStringList("roles");
                if (roles != null && !roles.isEmpty()) {
                    rol = roles.get(0);
                }
            } else {
                // Fallback a los headers de Kong si no hay JWT parseado
                String xUserId = request.getHeader("X-User-Id");
                if (xUserId != null && !xUserId.isEmpty()) usuario = xUserId;
                String xUserRoles = request.getHeader("X-User-Roles");
                if (xUserRoles != null && !xUserRoles.isEmpty()) rol = xUserRoles.split(",")[0];
            }

            java.util.Map<String, String> datos = new java.util.HashMap<>();
            datos.put("path", request.getRequestURI());

            EventoAuditoria evento = EventoAuditoria.builder()
                    .servicio("ms-zonas")
                    .accion(accion)
                    .entidad("ZONA")
                    .usuario(usuario)
                    .rol(rol)
                    .ip(ip)
                    .mac(mac)
                    .datos(datos)
                    .build();

            auditPublisher.publishAuditEvent(evento);
        }
    }

    private String extractIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isEmpty()) {
            return xfHeader.split(",")[0].trim();
        }
        String xrHeader = request.getHeader("X-Real-IP");
        if (xrHeader != null && !xrHeader.isEmpty()) {
            return xrHeader.trim();
        }
        return request.getRemoteAddr();
    }

    private String mapMethodToAction(String method) {
        return switch (method.toUpperCase()) {
            case "POST" -> "CREATE";
            case "PUT", "PATCH" -> "UPDATE";
            case "DELETE" -> "DELETE";
            default -> "SELECT";
        };
    }
}
