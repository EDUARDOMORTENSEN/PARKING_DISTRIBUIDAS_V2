import requests
import json

print("1. Iniciando sesión para obtener token...")
resp = requests.post('http://localhost:8000/api/usuarios/auth/login', json={'username':'susuario','password':'1728143247'})
if resp.status_code in (200, 201):
    token = resp.json()['access_token']
    print("   [OK] Token obtenido.")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print("\n2. Probando endpoint GET /api/v1/zonas...")
    zonas_resp = requests.get('http://localhost:8000/api/v1/zonas/', headers=headers)
    print("   Status Code:", zonas_resp.status_code)
    try:
        print("   Response:", json.dumps(zonas_resp.json(), indent=2))
    except:
        print("   Response:", zonas_resp.text)
else:
    print("   [ERROR] Login falló:", resp.status_code, resp.text)
