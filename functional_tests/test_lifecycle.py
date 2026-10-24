import requests

from config import BASE_URL

def get_stats():
    return requests.get(f"{BASE_URL}/tasks/stats").json()


def test_full_task_lifecycle():
    # Step 1: remember the stats before we start
    before = get_stats()

    # Step 2: create a task
    created = requests.post(f"{BASE_URL}/tasks", json={"title": "Lifecycle task"})
    assert created.status_code == 201
    task_id = created.json()["id"]

    # Step 3: stats should show one more pending task
    after_create = get_stats()
    assert after_create["total"] == before["total"] + 1
    assert after_create["pending"] == before["pending"] + 1

    # Step 4: mark the task as done
    updated = requests.patch(f"{BASE_URL}/tasks/{task_id}", json={"done": True})
    assert updated.status_code == 200
    assert updated.json()["done"] is True

    # Step 5: stats should show one more done task, pending back to the start value
    after_done = get_stats()
    assert after_done["done"] == before["done"] + 1
    assert after_done["pending"] == before["pending"]

    # Step 6: the task should appear in the "done" filter
    done_list = requests.get(f"{BASE_URL}/tasks", params={"done": "true"}).json()
    assert task_id in [task["id"] for task in done_list]

    # Step 7: delete the task
    deleted = requests.delete(f"{BASE_URL}/tasks/{task_id}")
    assert deleted.status_code == 204

    # Step 8: the task is gone and the stats are back to the start
    gone = requests.get(f"{BASE_URL}/tasks/{task_id}")
    assert gone.status_code == 404
    assert get_stats()["total"] == before["total"]