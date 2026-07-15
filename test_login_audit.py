import requests
import subprocess
import time

print("1. Probando endpoint POST /api/usuarios/auth/login...")
payload_login = {
    "username": "susuario",
    "password": "1728143247"
}

resp = requests.post('http://localhost:8000/api/usuarios/auth/login', json=payload_login)
print("   Status Code:", resp.status_code)

print("\n2. Esperando que el evento de auditoría se procese...")
time.sleep(2)

print("\n3. Consultando db-audit para verificar el registro del LOGIN...")
result = subprocess.run([
    "docker", "exec", "db-audit", "psql", "-U", "audit", "-d", "auditoria", "-c",
    "SELECT servicio, accion, entidad, username FROM evento_auditoria ORDER BY timestamp DESC LIMIT 3;"
], capture_output=True, text=True)

print(result.stdout)

if resp.status_code == 200:
    token = resp.json().get('access_token')
    
    print("\n4. Probando endpoint GET /api/v1/tickets/ (ticket-service)...")
    headers = {"Authorization": f"Bearer {token}"}
    resp_tickets = requests.get('http://localhost:8000/api/v1/tickets/', headers=headers)
    print("   Status Code:", resp_tickets.status_code)
    
    time.sleep(2)
    print("\n5. Consultando db-audit para verificar el registro de TICKET...")
    result2 = subprocess.run([
        "docker", "exec", "db-audit", "psql", "-U", "audit", "-d", "auditoria", "-c",
        "SELECT servicio, accion, entidad, username FROM evento_auditoria ORDER BY timestamp DESC LIMIT 3;"
    ], capture_output=True, text=True)
    print(result2.stdout)
