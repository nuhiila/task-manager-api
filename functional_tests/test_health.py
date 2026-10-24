import requests

from config import BASE_URL

def test_health_endpoint_returns_ok():
    response = requests.get(f"{BASE_URL}/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}