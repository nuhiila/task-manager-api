import os
import subprocess
import time
from pathlib import Path

import pytest
import requests

from config import BASE_URL, PORT

PROJECT_ROOT = Path(__file__).resolve().parent.parent


@pytest.fixture(scope="session", autouse=True)
def server():
    env = {**os.environ, "PORT": str(PORT)}
    process = subprocess.Popen(
        ["node", "src/server.js"],
        cwd=PROJECT_ROOT,
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        # wait up to 10 seconds for the server to answer
        for _ in range(50):
            try:
                if requests.get(f"{BASE_URL}/health", timeout=1).status_code == 200:
                    break
            except requests.exceptions.ConnectionError:
                time.sleep(0.2)
        else:
            raise RuntimeError("The server did not start in time")

        yield  # all the tests run here
    finally:
        process.terminate()
        process.wait(timeout=5)