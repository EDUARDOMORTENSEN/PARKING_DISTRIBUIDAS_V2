package ec.edu.espe.zonas.utils;

import org.springframework.stereotype.Component;

@Component
public class SanitizadorTexto {

    /**
     * Trim + colapsa espacios múltiples internos. Uso: nombre, descripcion.
     */
    public String limpiarTexto(String valor) {
        if (valor == null) return null;
        return valor.trim().replaceAll("\\s+", " ");
    }

    /**
     * Trim + mayúsculas. Uso: codigo de zona/espacio si el cliente lo envía.
     */
    public String normalizarCodigo(String valor) {
        if (valor == null) return null;
        return valor.trim().toUpperCase();
    }

    /**
     * Escapa caracteres HTML peligrosos sin depender de librerías externas.
     * Uso: descripcion (texto libre que podría renderizarse en un frontend).
     */
    public String escaparHtml(String valor) {
        if (valor == null) return null;
        return valor
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
    }
}
