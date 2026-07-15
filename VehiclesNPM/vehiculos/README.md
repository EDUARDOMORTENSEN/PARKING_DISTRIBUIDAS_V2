<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## GETWAY IMPLEMENTACION:

Diseño del módulo Gateway — Servicio Vehículos

1. Propósito

El servicio vehiculos expone, además de su CRUD administrativo, un módulo
gateway (/gateway/*) pensado específicamente para ser consumido por el
sistema de emisión de tickets. Este módulo es el único punto de entrada que
debería usar el sistema de tickets: no debe llamar directamente a
/vehiculos/* (CRUD administrativo) para operar el flujo de ingreso/salida.

Sistema de Tickets  --->  Gateway (/gateway/*)  --->  VehiculosService (BD)
                                  |
                                  ---> ZonasClientService ---> ModuloZonas (Spring Boot)

2. Cambios en el modelo de datos (Vehiculo)

CampoTipoMotivoestadoenum fuera / dentroEvita doble ingreso o salida sin ingreso previo. Es la fuente de verdad de ocupación a nivel de vehículo individual.fechaUltimoIngresotimestamp nullableInsumo para que el módulo de tickets calcule tiempo/tarifa.fechaUltimaSalidatimestamp nullableAuditoría / historial.activoboolean (default true)Bloqueo administrativo (lista negra, mora, vehículo reportado). El gateway rechaza el ingreso si es false. También reemplaza el borrado físico: DELETE /vehiculos/:id ahora hace baja lógica (activo = false) en vez de borrar la fila, porque los tickets históricos referencian al vehículo.


Nota de migración: como synchronize: true está activo en TypeORM, estos
campos se crean automáticamente en desarrollo. En un ambiente real con
datos existentes, esto debe ir como una migración explícita.



3. Endpoints del gateway

GET /gateway/vehiculos/:placa

Consulta de "preflight". El sistema de tickets la llama primero para saber
si ya existe el vehículo.

Respuesta si existe:

json{
  "registrado": true,
  "id": "uuid",
  "placa": "ABC-1234",
  "tipo": "auto",
  "clasificacion": "Gasolina",
  "estado": "fuera",
  "activo": true
}

Respuesta si no existe: { "registrado": false } (200, no 404 — es una
consulta de existencia, no un error).

POST /gateway/ingresos

Vehículo ya registrado, llega a la garita.

Request:

json{ "placa": "ABC-1234" }

Validaciones aplicadas, en orden:


El vehículo existe (404 si no).
activo = true (403 si está bloqueado).
estado != dentro (409 si ya estaba dentro: evita ticket duplicado).
Hay cupo disponible en ModuloZonas para su tipo (409 si no hay cupo,
503 si el servicio de zonas no responde y no se autorizó modo
degradado).


Respuesta (200):

json{
  "autorizado": true,
  "vehiculoId": "uuid",
  "placa": "ABC-1234",
  "tipo": "auto",
  "clasificacion": "Gasolina",
  "fechaIngreso": "2026-06-20T15:04:00.000Z"
}

El sistema de tickets usa esta respuesta para emitir el ticket de entrada
(número de ticket, código de barras, etc. — eso es responsabilidad de ese
sistema, no de vehiculos).

POST /gateway/ingresos/walk-in

Vehículo nuevo, capturado en garita. Registra y autoriza el ingreso en una
sola operación atómica a nivel de aplicación (si falla la validación de
cupo, igual queda creado el registro del vehículo — ver sección 5, punto
de mejora).

Request:

json{
  "vehiculo": {
    "tipo": "Auto",
    "datos": {
      "placa": "ABC-1234",
      "marca": "Toyota",
      "modelo": "Corolla",
      "color": "Rojo",
      "anio": 2022,
      "clasificacion": "Gasolina",
      "numeroPuertas": 4,
      "capacidadMaletero": 400
    }
  }
}

Reutiliza exactamente las validaciones del CreateVehiculoDto existente
(formato de placa, rangos, etc.).

POST /gateway/salidas

Request: { "placa": "ABC-1234" }

Validaciones: el vehículo existe y estado = dentro (si no, 409: no se
puede registrar salida sin ingreso activo).

Respuesta:

json{
  "autorizado": true,
  "vehiculoId": "uuid",
  "placa": "ABC-1234",
  "fechaIngreso": "2026-06-20T15:04:00.000Z",
  "fechaSalida": "2026-06-20T17:30:00.000Z"
}

4. Integración con ModuloZonas

ZonasClientService llama por HTTP a ModuloZonas (Spring Boot, otro
repositorio/proceso) para validar cupo por tipo de espacio (MOTO, AUTO,
BUSETA). Configuración por variable de entorno ZONAS_SERVICE_URL.

Bloqueante a resolver con el equipo de ModuloZonas: los endpoints
actuales de EspacioControlador (GET /api/v1/espacios/estado y
/zona-estado) reciben el filtro como @RequestBody en un método GET,
lo cual no es estándar y la mayoría de clientes HTTP no lo soportan de
forma confiable. El cliente implementado aquí asume un contrato limpio:

GET /api/v1/espacios/disponibilidad?tipo=AUTO
→ { "espaciosDisponibles": 12 }

Hay que agregar ese endpoint en ModuloZonas (o ajustar los existentes a
@RequestParam) antes de probar esta integración end-to-end.

Modo de falla configurable por request (permitirSinValidarCupo): si
ModuloZonas no responde, el llamador decide si el ingreso se autoriza en
modo degradado o se bloquea (por defecto, se bloquea).

5. Pendientes / mejoras recomendadas (fuera de este alcance)


Atomicidad en walk-in: si la validación de cupo falla después de
crear el vehículo, el registro queda creado pero sin ingreso. Para un
ambiente productivo con varias tablas, esto se resolvería con una
transacción de TypeORM o revirtiendo la creación si falla el cupo.
Autenticación servicio-a-servicio: el gateway no tiene guard/API key
todavía. Antes de exponerlo, agregar un ApiKeyGuard o JWT de servicio
para que solo el sistema de tickets autorizado pueda llamarlo.
Jest no resuelve el alias src/: error preexistente (no introducido
en este cambio) en vehiculos.service.ts (import ... from 'src/factory.vehiculo'). Falta configurar moduleNameMapper en el
bloque jest de package.json o cambiar el import a uno relativo.
npm install: agregué @nestjs/axios y axios a package.json;
hay que correr npm install para bajar esas dependencias (ya lo validé
en este entorno: instala y compila sin errores con tsc --noEmit).


6. Tabla resumen de validaciones del gateway

ReglaCódigo HTTP si fallaDónde se aplicaVehículo debe existir para ingreso/salida404VehiculosService.findByPlacaVehículo bloqueado (activo=false) no ingresa403VehiculosService.marcarIngresoNo se permite doble ingreso sin salida previa409VehiculosService.marcarIngresoNo se permite salida sin ingreso activo409VehiculosService.marcarSalidaDebe existir cupo disponible por tipo409GatewayService.validarCupoSiAplica + ModuloZonasPlaca duplicada en walk-in409GatewayService.registrarEIngresarFalla de comunicación con Zonas (modo estricto)503ZonasClientService