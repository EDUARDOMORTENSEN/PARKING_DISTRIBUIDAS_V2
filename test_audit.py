import requests
import subprocess
import time

print("1. Iniciando sesión para obtener token...")
resp = requests.post('http://localhost:8000/api/usuarios/auth/login', json={'username':'susuario','password':'1728143247'})
if resp.status_code in (200, 201):
    token = resp.json()['access_token']
    print("   [OK] Token obtenido.")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "X-MAC-Address": "00:11:22:33:44:55"
    }
    
    print("\n2. Obteniendo lista de zonas...")
    zonas_resp = requests.get('http://localhost:8000/api/v1/zonas/', headers=headers)
    if zonas_resp.status_code == 200:
        zonas = zonas_resp.json()
        if len(zonas) > 0:
            id_zona = zonas[0]['id']
            print(f"   [OK] Zona encontrada. ID: {id_zona}")
            
            payload_espacio = {
                "idZona": id_zona,
                "descripcion": "Espacio de auditoría automatizado",
                "tipo": "AUTO",
                "estado": "DISPONIBLE"
            }
            
            print(f"\n3. Creando espacio en la zona {id_zona}...")
            esp_resp = requests.post('http://localhost:8000/api/v1/espacios/', headers=headers, json=payload_espacio)
            print("   Status Code:", esp_resp.status_code)
            print("   Response:", esp_resp.text)
            
            if esp_resp.status_code in (200, 201):
                print("\n4. Esperando que el evento de auditoría se procese...")
                time.sleep(2)
                
                print("\n5. Consultando db-audit...")
                result = subprocess.run([
                    "docker", "exec", "db-audit", "psql", "-U", "audit", "-d", "auditoria", "-c",
                    "SELECT servicio, accion, entidad, username, ip, mac FROM evento_auditoria ORDER BY timestamp DESC LIMIT 1;"
                ], capture_output=True, text=True)
                
                print(result.stdout)
                
                print("\n6. Probando endpoint GET /api/v1/audit (Obtener todos los eventos)...")
                audit_resp = requests.get('http://localhost:8000/api/v1/audit', headers=headers)
                print("   Status Code:", audit_resp.status_code)
                if audit_resp.status_code == 200:
                    eventos = audit_resp.json()
                    print(f"   [OK] Se obtuvieron {len(eventos)} eventos.")
                    
                    if len(eventos) > 0:
                        primer_evento_id = eventos[0]['id']
                        print(f"\n7. Probando endpoint GET /api/v1/audit/{{id}} con ID {primer_evento_id}...")
                        audit_id_resp = requests.get(f'http://localhost:8000/api/v1/audit/{primer_evento_id}', headers=headers)
                        print("   Status Code:", audit_id_resp.status_code)
                        if audit_id_resp.status_code == 200:
                            print(f"   [OK] Evento obtenido: Acción -> {audit_id_resp.json().get('accion')} | Entidad -> {audit_id_resp.json().get('entidad')}")
                        else:
                            print("   [ERROR] No se pudo obtener el evento por ID:", audit_id_resp.text)
                else:
                    print("   [ERROR] No se pudieron obtener los eventos:", audit_resp.text)
                    
                print("\n8. Probando endpoint POST /api/v1/audit (Crear evento manualmente)...")
                payload_audit = {
                    "servicio": "ms-test",
                    "accion": "CREATE",
                    "entidad": "TEST-ENT",
                    "entidadId": "123e4567-e89b-12d3-a456-426614174000",
                    "usuario": "susuario",
                    "rol": "admin",
                    "ip": "127.0.0.1",
                    "mac": "00:11:22:33:44:55",
                    "datos": {"info": "test de endpoint POST"}
                }
                audit_post_resp = requests.post('http://localhost:8000/api/v1/audit', headers=headers, json=payload_audit)
                print("   Status Code:", audit_post_resp.status_code)
                if audit_post_resp.status_code in (200, 201):
                    print("   [OK] Evento creado manualmente vía endpoint.")
                    print("   Response:", audit_post_resp.json())
                else:
                    print("   [ERROR] No se pudo crear evento:", audit_post_resp.text)
        else:
            print("   [ERROR] No hay zonas disponibles para crear el espacio. Crea una zona primero.")
    else:
        print("   [ERROR] No se pudo obtener zonas:", zonas_resp.status_code, zonas_resp.text)
else:
    print("   [ERROR] Login falló:", resp.status_code, resp.text)
