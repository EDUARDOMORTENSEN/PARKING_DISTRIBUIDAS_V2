import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings

JWKS_URL = settings.PUBLIC_KEY_URL  # URL del endpoint que devuelve el JWKS del auth-service

# El cliente cachea el JWKS y refresca automáticamente si aparece un kid desconocido
jwks_client = PyJWKClient(JWKS_URL, cache_keys=True, lifespan=3600)

bearer_scheme = HTTPBearer()

def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    token = credentials.credentials
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],  # nunca dejes que el token dicte el algoritmo
            options={"verify_aud": False},  # audience es un array en el JWT, verificar manualmente
        )
        return payload
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido: {str(e)}",
        )