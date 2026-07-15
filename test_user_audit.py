import requests
import subprocess
import time

print("1. Probando endpoint POST /api/usuarios/personas...")
payload_persona = {
    "dni": "1710000025",
    "email": "test.audit3@example.com",
    "firstName": "Test",
    "lastName": "Audit",
    "nationality": "Ecuatoriana",
    "phone": "+593999999997"
}

resp = requests.post('http://localhost:8000/api/usuarios/personas', json=payload_persona)
print("   Status Code:", resp.status_code)
print("   Response:", resp.text)

if resp.status_code in (200, 201):
    print("\n2. Esperando que el evento de auditoría se procese...")
    time.sleep(2)
    
    print("\n3. Consultando db-audit para verificar el registro del usuario...")
    result = subprocess.run([
        "docker", "exec", "db-audit", "psql", "-U", "audit", "-d", "auditoria", "-c",
        "SELECT servicio, accion, entidad, username, ip, mac FROM evento_auditoria ORDER BY timestamp DESC LIMIT 1;"
    ], capture_output=True, text=True)
    
    print(result.stdout)
else:
    print("   [ERROR] No se pudo crear la persona.")
