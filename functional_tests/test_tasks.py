import requests

from config import BASE_URL

def test_create_task():
    response = requests.post(f"{BASE_URL}/tasks", json={"title": "Learn pytest"})

    assert response.status_code == 201
    task = response.json()
    assert task["title"] == "Learn pytest"
    assert task["done"] is False
    assert "id" in task


def test_created_task_appears_in_list():
    created = requests.post(f"{BASE_URL}/tasks", json={"title": "Find me"}).json()

    response = requests.get(f"{BASE_URL}/tasks")

    assert response.status_code == 200
    ids = [task["id"] for task in response.json()]
    assert created["id"] in ids


def test_get_task_by_id():
    created = requests.post(f"{BASE_URL}/tasks", json={"title": "Read me"}).json()

    response = requests.get(f"{BASE_URL}/tasks/{created['id']}")

    assert response.status_code == 200
    assert response.json()["title"] == "Read me"