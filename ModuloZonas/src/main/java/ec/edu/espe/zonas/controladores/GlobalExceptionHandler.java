package ec.edu.espe.zonas.controladores;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        List<Map<String, String>> errores = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> {
                    Map<String, String> errorMap = new HashMap<>();
                    errorMap.put("campo", error.getField());
                    errorMap.put("mensaje", error.getDefaultMessage());
                    return errorMap;
                })
                .toList();

        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("error", "Error de validación");
        response.put("errores", errores);
        response.put("timestamp", LocalDateTime.now(java.time.ZoneOffset.UTC).toString());

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", ex.getStatusCode().value());
        response.put("error", ex.getReason());
        response.put("timestamp", LocalDateTime.now(java.time.ZoneOffset.UTC).toString());

        return new ResponseEntity<>(response, ex.getStatusCode());
    }
}
