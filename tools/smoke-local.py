"""Read-only HTTP checks for the running local course API and its demo login."""
import argparse
import json
import urllib.error
import urllib.request

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--base", default="http://127.0.0.1:5081")
args = parser.parse_args()
base = args.base.rstrip("/")

def request(path, body=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    req = urllib.request.Request(base + path, data=json.dumps(body).encode() if body else None, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            return response.status, json.load(response)
    except urllib.error.HTTPError as error:
        return error.code, None

status, schema = request("/swagger/v1/swagger.json")
assert status == 200 and schema.get("paths"), "Swagger is unavailable"
status, _ = request("/api/v1/Auth/login", {"email": "admin@test.com", "password": "incorrect"})
assert status == 401, "Invalid password was not rejected"
status, auth = request("/api/v1/Auth/login", {"email": "admin@test.com", "password": "Admin@123!"})
assert status == 200 and auth.get("accessToken"), "Demo login failed"
status, data = request("/api/v1/TiposSolicitud", token=auth["accessToken"])
assert status == 200 and isinstance(data, list), "Authenticated query failed"
print("OK: Swagger, rechazo de clave incorrecta, login y consulta autenticada")
