import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert "Chess Club" in data
    assert "Programming Class" in data


def test_signup_for_activity_success():
    email = "nuevo@mergington.edu"
    response = client.post("/activities/Chess Club/signup?email=" + email)
    assert response.status_code == 200
    assert "Signed up" in response.json()["message"]


def test_signup_for_activity_already_signed_up():
    email = "michael@mergington.edu"
    response = client.post(f"/activities/Chess Club/signup?email={email}")
    assert response.status_code == 400
    assert response.json()["detail"] == "Student is already signed up"


def test_signup_for_activity_not_found():
    response = client.post("/activities/NoExiste/signup?email=alguien@mergington.edu")
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"
