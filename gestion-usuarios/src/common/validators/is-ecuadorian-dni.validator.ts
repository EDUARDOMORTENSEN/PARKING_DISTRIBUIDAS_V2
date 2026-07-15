import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isEcuadorianDni', async: false })
export class IsEcuadorianDniConstraint implements ValidatorConstraintInterface {
  validate(dni: string): boolean {
    if (typeof dni !== 'string') return false;
    if (!/^\d{10}$/.test(dni)) return false; // exactamente 10 dígitos numéricos

    const provincia = parseInt(dni.substring(0, 2), 10);
    if (provincia < 1 || provincia > 24) return false; // código de provincia válido (incluye Galápagos=20, Zonas no delimitadas=24)

    const tercerDigito = parseInt(dni.charAt(2), 10);
    if (tercerDigito > 6) return false; // tercer dígito debe ser 0-6 para cédula de persona natural

    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;

    for (let i = 0; i < coeficientes.length; i++) {
      let valor = parseInt(dni.charAt(i), 10) * coeficientes[i];
      if (valor >= 10) valor -= 9;
      suma += valor;
    }

    const digitoVerificador = parseInt(dni.charAt(9), 10);
    const decenaSuperior = Math.ceil(suma / 10) * 10;
    const resultado = decenaSuperior - suma === 10 ? 0 : decenaSuperior - suma;

    return resultado === digitoVerificador;
  }

  defaultMessage(): string {
    return 'El DNI no es una cédula ecuatoriana válida';
  }
}

export function IsEcuadorianDni(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEcuadorianDniConstraint,
    });
  };
}