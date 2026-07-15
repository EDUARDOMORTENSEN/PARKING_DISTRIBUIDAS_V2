import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';
/**
 * Limpia espacios al inicio/final y colapsa espacios múltiples internos.
 * Uso: nombres, apellidos, nacionalidad, etc.
 */
export function TrimAndCollapse() {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  );
}

/**
 * Trim + lowercase. Uso: email.
 */
export function NormalizeEmail() {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
}

/**
 * Solo trim, sin tocar mayúsculas. Uso: dni, phone.
 */
export function TrimOnly() {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}

/**
 * Elimina cualquier tag HTML/script del input. Uso: campos de texto libre
 * que podrían renderizarse en un frontend (address, description).
 */
export function SanitizeHtml() {
  return Transform(({ value }) =>
    typeof value === 'string'
      ? sanitizeHtml(value.trim(), { allowedTags: [], allowedAttributes: {} })
      : value,
  );
}

/**
 * Trim + mayúsculas. Uso: name de Role (convención ADMIN, USER_MANAGER).
 */
export function ToUpperCaseTrim() {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  );
}
/**
 * Trim + minúsculas. Uso: username (debe coincidir con la convención de generateUsername()).
 */
export function TrimOnlyLower() {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
}