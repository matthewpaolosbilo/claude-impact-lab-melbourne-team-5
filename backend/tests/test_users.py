def test_post_user_creates_and_returns_user(client):
    response = client.post(
        "/api/users",
        json={"name": "Priya", "email": "priya@example.com"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["id"]
    assert body["name"] == "Priya"
    assert body["email"] == "priya@example.com"
    assert body["bio"] is None
    assert "created_at" in body


def test_post_user_with_existing_email_returns_existing_user(client):
    first = client.post(
        "/api/users",
        json={"name": "Priya", "email": "priya@example.com"},
    ).json()

    again = client.post(
        "/api/users",
        json={"name": "Different Name", "email": "priya@example.com"},
    )

    assert again.status_code == 200
    body = again.json()
    assert body["id"] == first["id"]
    assert body["name"] == "Priya"


def test_get_user_by_id_returns_user(client, a_user):
    response = client.get(f"/api/users/{a_user.id}")
    assert response.status_code == 200
    assert response.json()["email"] == a_user.email


def test_get_user_404_when_missing(client):
    response = client.get("/api/users/9999")
    assert response.status_code == 404
