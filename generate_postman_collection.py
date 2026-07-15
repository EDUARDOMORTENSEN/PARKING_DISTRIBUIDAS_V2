import json

collection = {
    "info": {
        "name": "Pruebas Auditoria - Endpoints CREATE",
        "description": "Colección para probar todos los endpoints de creación (POST) y verificar que generen eventos de auditoría.",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "variable": [
        {
            "key": "base_url",
            "value": "http://localhost:8000",
            "type": "string"
        },
        {
            "key": "token",
            "value": "Aqui_poner_un_token_valido_generado_en_el_login",
            "type": "string"
        }
    ],
    "item": [
        {
            "name": "1. Usuarios - Crear Persona y Usuario",
            "request": {
                "method": "POST",
                "header": [
                    {"key": "Content-Type", "value": "application/json"}
                ],
                "url": {
                    "raw": "{{base_url}}/api/usuarios/personas",
                    "host": ["{{base_url}}"],
                    "path": ["api", "usuarios", "personas"]
                },
                "body": {
                    "mode": "raw",
                    "raw": json.dumps({
                        "dni": "1710000041",
                        "email": "postman.audit@example.com",
                        "firstName": "Postman",
                        "lastName": "Audit",
                        "nationality": "Ecuatoriana",
                        "phone": "+593999999995"
                    }, indent=4),
                    "options": {"raw": {"language": "json"}}
                }
            }
        },
        {
            "name": "2. Zonas - Crear Zona",
            "request": {
                "method": "POST",
                "header": [
                    {"key": "Content-Type", "value": "application/json"},
                    {"key": "Authorization", "value": "Bearer {{token}}"}
                ],
                "url": {
                    "raw": "{{base_url}}/api/v1/zonas/",
                    "host": ["{{base_url}}"],
                    "path": ["api", "v1", "zonas", ""]
                },
                "body": {
                    "mode": "raw",
                    "raw": json.dumps({
                        "nombre": "Zona Sur",
                        "descripcion": "Parqueadero exclusivo",
                        "capacidad": 50,
                        "tipo": "REGULAR"
                    }, indent=4),
                    "options": {"raw": {"language": "json"}}
                }
            }
        },
        {
            "name": "3. Zonas - Crear Espacio",
            "request": {
                "method": "POST",
                "header": [
                    {"key": "Content-Type", "value": "application/json"},
                    {"key": "Authorization", "value": "Bearer {{token}}"}
                ],
                "url": {
                    "raw": "{{base_url}}/api/v1/espacios/",
                    "host": ["{{base_url}}"],
                    "path": ["api", "v1", "espacios", ""]
                },
                "body": {
                    "mode": "raw",
                    "raw": json.dumps({
                        "descripcion": "Espacio regular",
                        "tipo": "AUTO",
                        "idZona": "00000000-0000-0000-0000-000000000000"
                    }, indent=4),
                    "options": {"raw": {"language": "json"}}
                }
            }
        },
        {
            "name": "4. Vehiculos - Crear Vehiculo",
            "request": {
                "method": "POST",
                "header": [
                    {"key": "Content-Type", "value": "application/json"},
                    {"key": "Authorization", "value": "Bearer {{token}}"}
                ],
                "url": {
                    "raw": "{{base_url}}/api/vehiculos",
                    "host": ["{{base_url}}"],
                    "path": ["api", "vehiculos"]
                },
                "body": {
                    "mode": "raw",
                    "raw": json.dumps({
                        "tipo": "Auto",
                        "datos": {
                            "placa": "PBM-1234",
                            "marca": "Chevrolet",
                            "modelo": "Aveo",
                            "color": "Blanco",
                            "anio": 2020,
                            "clasificacion": "Gasolina",
                            "numeroPuertas": 4,
                            "capacidadMaletero": 300
                        }
                    }, indent=4),
                    "options": {"raw": {"language": "json"}}
                }
            }
        },
        {
            "name": "5. Asignaciones - Crear Asignacion",
            "request": {
                "method": "POST",
                "header": [
                    {"key": "Content-Type", "value": "application/json"},
                    {"key": "Authorization", "value": "Bearer {{token}}"}
                ],
                "url": {
                    "raw": "{{base_url}}/api/asignaciones",
                    "host": ["{{base_url}}"],
                    "path": ["api", "asignaciones"]
                },
                "body": {
                    "mode": "raw",
                    "raw": json.dumps({
                        "userId": "aqui-va-el-id-del-usuario-propietario",
                        "vehicleId": "aqui-va-el-id-del-vehiculo",
                        "notas": "Asignado en pruebas de auditoria"
                    }, indent=4),
                    "options": {"raw": {"language": "json"}}
                }
            }
        },
        {
            "name": "6. Tickets - Ingreso Vehiculo",
            "request": {
                "method": "POST",
                "header": [
                    {"key": "Content-Type", "value": "application/json"},
                    {"key": "Authorization", "value": "Bearer {{token}}"}
                ],
                "url": {
                    "raw": "{{base_url}}/api/v1/tickets/ingreso",
                    "host": ["{{base_url}}"],
                    "path": ["api", "v1", "tickets", "ingreso"]
                },
                "body": {
                    "mode": "raw",
                    "raw": json.dumps({
                        "id_espacio": "aqui-va-el-id-del-espacio",
                        "id_usuario": "aqui-va-el-id-del-usuario-cliente",
                        "placa": "PBM-1234"
                    }, indent=4),
                    "options": {"raw": {"language": "json"}}
                }
            }
        }
    ]
}

with open("Audit_Create_Operations.postman_collection.json", "w", encoding="utf-8") as f:
    json.dump(collection, f, indent=2, ensure_ascii=False)

print("Coleccion guardada exitosamente.")
