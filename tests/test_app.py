import sys
import os

sys.path.insert(0, os.path.abspath("."))

from app import app


def test_home():
    client = app.test_client()

    res = client.get("/")

    assert res.status_code == 200