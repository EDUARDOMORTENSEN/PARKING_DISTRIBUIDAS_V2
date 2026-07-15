import requests

print("Logging in...")
resp = requests.post('http://localhost:8000/api/usuarios/auth/login', json={'username':'susuario','password':'1728143247'})
if resp.status_code in (200, 201):
    token = resp.json()['access_token']
    print("Token obtained successfully.")
    
    print("\nTesting Zonas API...")
    headers = {"Authorization": f"Bearer {token}"}
    z_resp = requests.get('http://localhost:8000/api/v1/zonas/', headers=headers)
    print("Zonas GET status:", z_resp.status_code)
    
    print("\nTesting Vehiculos API...")
    v_resp = requests.get('http://localhost:8000/api/vehiculos', headers=headers)
    print("Vehiculos GET status:", v_resp.status_code)
    
    print("\nTesting Asignaciones API...")
    a_resp = requests.get('http://localhost:8000/api/asignaciones', headers=headers)
    print("Asignaciones GET status:", a_resp.status_code)
else:
    print("Login failed:", resp.status_code, resp.text)
