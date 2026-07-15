import httpx

from app.utils.exceptions import ServicioExternoException


class BaseHttpClient:
    def __init__(self, base_url: str, timeout: float = 5.0):
        self.base_url = base_url
        self.timeout = timeout

    async def get(self, path: str, token: str | None = None) -> httpx.Response:
        headers = {"Authorization": token} if token else {}
        try:
            async with httpx.AsyncClient(
                base_url=self.base_url, timeout=self.timeout
            ) as client:
                return await client.get(path, headers=headers)
        except httpx.RequestError as exc:
            raise ServicioExternoException(
                f"No se pudo conectar con {self.base_url}: {exc}"
            )

    async def post(self, path: str, json_data: any = None, token: str | None = None) -> httpx.Response:
        headers = {"Authorization": token} if token else {}
        try:
            async with httpx.AsyncClient(
                base_url=self.base_url, timeout=self.timeout
            ) as client:
                return await client.post(path, headers=headers, json=json_data)
        except httpx.RequestError as exc:
            raise ServicioExternoException(
                f"No se pudo conectar con {self.base_url} (POST): {exc}"
            )