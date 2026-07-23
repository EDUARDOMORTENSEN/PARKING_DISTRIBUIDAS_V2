"""
Script de datos de prueba (mock data) para el sistema ParkingDS.
Genera 10 usuarios con diferentes roles, vehiculos y tickets.

Ejecucion: python seed_mock_data.py
"""
import requests


BASE = "http://localhost:8000/api"
HEADERS = {"Content-Type": "application/json"}


def generate_valid_cedula(provincia: int, seq: int) -> str:
    """Generate a valid Ecuadorian cedula with check digit."""
    base = f"{provincia:02d}{seq:07d}"  # 9 digits
    coefs = [2, 1, 2, 1, 2, 1, 2, 1, 2]
    total = 0
    for i, c in enumerate(coefs):
        v = int(base[i]) * c
        if v >= 10:
            v -= 9
        total += v
    check = (10 - (total % 10)) % 10
    return base + str(check)


# Generate 10 valid cedulas
CEDULAS = [generate_valid_cedula(17, 10000 + i) for i in range(10)]

PERSONAS = [
    {"firstName": "Carlos", "lastName": "Administrador", "dni": CEDULAS[0], "email": "carlos.admin@parking.com", "phone": "+593912345601", "nationality": "Ecuatoriano"},
    {"firstName": "Maria", "lastName": "Recaudadora", "dni": CEDULAS[1], "email": "maria.recaud@parking.com", "phone": "+593912345602", "nationality": "Ecuatoriana"},
    {"firstName": "Juan", "lastName": "Perez", "dni": CEDULAS[2], "email": "juan.perez@parking.com", "phone": "+593912345603", "nationality": "Ecuatoriano"},
    {"firstName": "Ana", "lastName": "Garcia", "dni": CEDULAS[3], "email": "ana.garcia@parking.com", "phone": "+593912345604", "nationality": "Ecuatoriana"},
    {"firstName": "Luis", "lastName": "Martinez", "dni": CEDULAS[4], "email": "luis.martinez@parking.com", "phone": "+593912345605", "nationality": "Ecuatoriano"},
    {"firstName": "Sofia", "lastName": "Lopez", "dni": CEDULAS[5], "email": "sofia.lopez@parking.com", "phone": "+593912345606", "nationality": "Ecuatoriana"},
    {"firstName": "Diego", "lastName": "Rodriguez", "dni": CEDULAS[6], "email": "diego.rod@parking.com", "phone": "+593912345607", "nationality": "Ecuatoriano"},
    {"firstName": "Camila", "lastName": "Torres", "dni": CEDULAS[7], "email": "camila.torres@parking.com", "phone": "+593912345608", "nationality": "Ecuatoriana"},
    {"firstName": "Pedro", "lastName": "Sanchez", "dni": CEDULAS[8], "email": "pedro.sanchez@parking.com", "phone": "+593912345609", "nationality": "Ecuatoriano"},
    {"firstName": "Valentina", "lastName": "Herrera", "dni": CEDULAS[9], "email": "vale.herrera@parking.com", "phone": "+593912345610", "nationality": "Ecuatoriana"},
]

VEHICULOS = [
    {"tipo": "Auto", "datos": {"placa": "ABC-1234", "marca": "Toyota", "modelo": "Corolla", "color": "Blanco", "anio": 2022, "clasificacion": "Gasolina", "numeroPuertas": 4, "capacidadMaletero": 450}},
    {"tipo": "Auto", "datos": {"placa": "DEF-5678", "marca": "Hyundai", "modelo": "Tucson", "color": "Negro", "anio": 2023, "clasificacion": "Hibrido", "numeroPuertas": 5, "capacidadMaletero": 500}},
    {"tipo": "Motocicleta", "datos": {"placa": "GHI-123A", "marca": "Yamaha", "modelo": "MT-07 Sport", "color": "Azul", "anio": 2021, "clasificacion": "Gasolina", "tipoMoto": "Deportiva"}},
    {"tipo": "Camioneta", "datos": {"placa": "JKL-9012", "marca": "Chevrolet", "modelo": "D-Max V6", "color": "Rojo", "anio": 2020, "clasificacion": "Diesel", "cabina": "doble", "capacidadCarga": 1000}},
    {"tipo": "Auto", "datos": {"placa": "MNO-3456", "marca": "Kia", "modelo": "Rio Sedan", "color": "Gris", "anio": 2024, "clasificacion": "Gasolina", "numeroPuertas": 4, "capacidadMaletero": 325}},
]


def login(username, password):
    res = requests.post(f"{BASE}/usuarios/auth/login", json={"username": username, "password": password})
    if res.status_code == 200:
        return res.json()["access_token"]
    print(f"  [X] Login failed for {username}: {res.text[:100]}")
    return None


def auth_h(token):
    return {**HEADERS, "Authorization": f"Bearer {token}"}


def main():
    print("=" * 60)
    print("  SEED MOCK DATA - ParkingDS")
    print("=" * 60)

    print("\n[1] Login como ROOT...")
    root_token = login("susuario", "1728143247")
    if not root_token:
        print("  [X] No se pudo autenticar como ROOT.")
        return
    print("  [OK] ROOT autenticado")
    h = auth_h(root_token)

    print("\n[2] Creando 10 personas...")
    created_users = []
    for i, p in enumerate(PERSONAS):
        res = requests.post(f"{BASE}/usuarios/personas", json=p)
        if res.status_code == 201:
            data = res.json()
            user_id = data["user"]["id"]
            username = data["user"]["username"]
            persona_id = data["persona"]["id"]
            created_users.append({"index": i, "user_id": user_id, "username": username, "persona_id": persona_id, "dni": p["dni"]})
            print(f"  [OK] [{i+1}] {p['firstName']} {p['lastName']} -> user: {username} (pwd: {p['dni']})")
        elif res.status_code == 409:
            print(f"  [!!] [{i+1}] {p['firstName']} {p['lastName']} ya existe")
            try:
                pr = requests.get(f"{BASE}/usuarios/personas/dni/{p['dni']}", headers=h)
                if pr.status_code == 200:
                    pd = pr.json()
                    created_users.append({"index": i, "user_id": pd["user"]["id"], "username": pd["user"]["username"], "persona_id": pd["id"], "dni": p["dni"]})
            except Exception:
                pass
        else:
            print(f"  [X] [{i+1}] Error: {res.text[:120]}")

    print("\n[3] Asignando roles...")
    role_assignments = {0: "ADMIN", 1: "RECAUDADOR"}
    for idx, role in role_assignments.items():
        user = next((u for u in created_users if u["index"] == idx), None)
        if user:
            res = requests.post(f"{BASE}/usuarios/roleusers", json={"id_user": user["user_id"], "role_name": role}, headers=h)
            if res.status_code in [201, 200]:
                print(f"  [OK] {user['username']} -> {role}")
            else:
                print(f"  [!!] {user['username']} -> {role}: {res.status_code}")

    admin_user = next((u for u in created_users if u["index"] == 0), None)
    ha = h
    if admin_user:
        at = login(admin_user["username"], admin_user["dni"])
        if at:
            ha = auth_h(at)

    print("\n[4] Registrando vehiculos...")
    for vi, (vehiculo, client_idx) in enumerate(zip(VEHICULOS, [2, 3, 4, 5, 6])):
        client = next((u for u in created_users if u["index"] == client_idx), None)
        if client:
            payload = {**vehiculo, "idPropietario": client["persona_id"]}
            res = requests.post(f"{BASE}/vehiculos", json=payload, headers=ha)
            if res.status_code in [201, 200]:
                print(f"  [OK] {vehiculo['datos']['placa']} ({vehiculo['tipo']}) -> {client['username']}")
            else:
                print(f"  [!!] {vehiculo['datos']['placa']}: {res.status_code} {res.text[:100]}")

    print("\n[5] Generando tickets...")
    recaud = next((u for u in created_users if u["index"] == 1), None)
    if recaud:
        rt = login(recaud["username"], recaud["dni"])
        if rt:
            hr = auth_h(rt)
            sr = requests.get(f"{BASE}/v1/espacios/", headers=hr)
            if sr.status_code == 200:
                disponibles = [s for s in sr.json() if s["estado"] == "DISPONIBLE"]
                tickets_to_create = [
                    {"placa": "ABC-1234", "client_idx": 2},
                    {"placa": "DEF-5678", "client_idx": 3},
                ]
                for td in tickets_to_create:
                    if disponibles:
                        espacio = disponibles.pop(0)
                        client = next((u for u in created_users if u["index"] == td["client_idx"]), None)
                        if client:
                            payload = {"id_espacio": espacio["id"], "id_usuario": client["user_id"], "placa": td["placa"]}
                            res = requests.post(f"{BASE}/v1/tickets/", json=payload, headers=hr)
                            if res.status_code in [201, 200]:
                                t = res.json()
                                print(f"  [OK] Ticket {t['codigo_ticket']} -> {td['placa']} en {espacio['codigo']}")
                            else:
                                print(f"  [!!] Ticket {td['placa']}: {res.status_code} {res.text[:100]}")

    print("\n" + "=" * 60)
    print("  SEED COMPLETADO")
    print("=" * 60)
    print(f"\n  {'Usuario':<20} {'Contrasena':<15} {'Rol'}")
    print(f"  {'='*20} {'='*15} {'='*15}")
    for u in created_users:
        role = "ADMIN" if u["index"] == 0 else "RECAUDADOR" if u["index"] == 1 else "CLIENTE"
        print(f"  {u['username']:<20} {u['dni']:<15} {role}")
    print()


if __name__ == "__main__":
    main()
