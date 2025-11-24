import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)


def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)


def test_signup_for_activity():
    activity_name = "Chess Club"
    email = "testuser@mergington.edu"
    response = client.post(f"/activities/{activity_name}/signup", params={"email": email})
    assert response.status_code == 200
    assert response.json()["message"] == f"Signed up {email} for {activity_name}"


def test_remove_participant():
    activity_name = "Chess Club"
    email = "testuser@mergington.edu"
    response = client.post(f"/activities/{activity_name}/remove", params={"email": email})
    assert response.status_code == 200
    assert response.json()["message"] == f"Removed {email} from {activity_name}"