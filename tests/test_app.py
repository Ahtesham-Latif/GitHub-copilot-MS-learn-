from fastapi.testclient import TestClient
from src.app import app

# Initialize the test client
client = TestClient(app)

def test_get_activities():
    # ==========================================
    # ARRANGE
    # ==========================================
    # No complex setup is needed here since we are fetching the default list,
    # but we can define our target endpoint.
    endpoint = "/activities"

    # ==========================================
    # ACT
    # ==========================================
    response = client.get(endpoint)

    # ==========================================
    # ASSERT
    # ==========================================
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    
    # Verify our default data is present
    activity_names = [activity["name"] for activity in data]
    assert "Chess Club" in activity_names


def test_signup_for_activity():
    # ==========================================
    # ARRANGE
    # ==========================================
    activity_name = "Drama Club"
    student_email = "test.student@mergington.edu"
    endpoint = f"/activities/{activity_name}/signup"
    payload = {"email": student_email}

    # ==========================================
    # ACT
    # ==========================================
    response = client.post(endpoint, json=payload)

    # ==========================================
    # ASSERT
    # ==========================================
    assert response.status_code == 200
    
    data = response.json()
    assert data["message"] == f"Signed up {student_email} for {activity_name}"
    # Verify the student was actually added to the participants list in the response
    assert student_email in data["activity"]["participants"]


def test_unregister_from_activity():
    # ==========================================
    # ARRANGE
    # ==========================================
    activity_name = "Chess Club"
    student_email = "michael@mergington.edu"
    endpoint = f"/activities/{activity_name}/signup"
    payload = {"email": student_email}

    # ==========================================
    # ACT
    # ==========================================
    # Use .request() instead of .delete() to pass a JSON body
    response = client.request("DELETE", endpoint, json=payload)

    # ==========================================
    # ASSERT
    # ==========================================
    assert response.status_code == 200
    
    data = response.json()
    assert data["message"] == f"Unregistered {student_email} from {activity_name}"
    assert student_email not in data["activity"]["participants"]

def test_signup_with_invalid_email_fails():
    # ==========================================
    # ARRANGE
    # ==========================================
    activity_name = "Chess Club"
    # Using an email that doesn't end in @mergington.edu to test our Pydantic validation
    invalid_email = "hacker@gmail.com"
    endpoint = f"/activities/{activity_name}/signup"
    payload = {"email": invalid_email}

    # ==========================================
    # ACT
    # ==========================================
    response = client.post(endpoint, json=payload)

    # ==========================================
    # ASSERT
    # ==========================================
    # Expecting a 422 Unprocessable Entity due to Pydantic validation failure
    assert response.status_code == 422