import pytest
import requests

from config import BASE_URL

@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"title": ""},
        {"title": "   "},
        {"title": 42},
        {"title": "x" * 101},
    ],
)
def test_create_task_with_invalid_title_returns_400(payload):
    response = requests.post(f"{BASE_URL}/tasks", json=payload)

    assert response.status_code == 400
    assert "error" in response.json()


def test_error_message_when_title_is_missing():
    response = requests.post(f"{BASE_URL}/tasks", json={})

    assert response.json()["error"] == "Title is required"


def test_update_with_invalid_done_value_returns_400():
    task = requests.post(f"{BASE_URL}/tasks", json={"title": "Task"}).json()

    response = requests.patch(f"{BASE_URL}/tasks/{task['id']}", json={"done": "yes"})

    assert response.status_code == 400
    assert response.json()["error"] == "done must be a boolean"


@pytest.mark.parametrize("method", ["get", "patch", "delete"])
@pytest.mark.parametrize("task_id", [999999, "abc"])
def test_unknown_task_returns_404(method, task_id):
    response = requests.request(
        method, f"{BASE_URL}/tasks/{task_id}", json={"done": True}
    )

    assert response.status_code == 404
    assert response.json()["error"] == "Task not found"