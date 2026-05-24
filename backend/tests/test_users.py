def test_post_user_creates_and_returns_user(client):
    response = client.post(
        "/api/users",
        json={"name": "Priya", "password": "test-share-password"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["id"]
    assert body["name"] == "Priya"
    assert body["email"] == "priya@spacd.shared"
    assert body["token"]
    assert body["bio"] is None
    assert body["preferences"] is None
    assert "created_at" in body


def test_get_user_returns_preferences_field(client, db_session, a_user):
    a_user.preferences = {"melbourne_reason": "study"}
    db_session.commit()

    response = client.get(f"/api/users/{a_user.id}")
    assert response.status_code == 200
    assert response.json()["preferences"] == {"melbourne_reason": "study"}


def test_post_user_with_existing_name_returns_existing_user(client):
    first = client.post(
        "/api/users",
        json={"name": "Priya", "password": "test-share-password"},
    ).json()

    again = client.post(
        "/api/users",
        json={"name": "Priya", "password": "test-share-password"},
    )

    assert again.status_code == 200
    body = again.json()
    assert body["id"] == first["id"]
    assert body["name"] == "Priya"
    assert body["token"]


def test_post_user_rejects_wrong_shared_password(client):
    response = client.post(
        "/api/users",
        json={"name": "Priya", "password": "wrong"},
    )

    assert response.status_code == 401


def test_get_user_by_id_returns_user(client, a_user):
    response = client.get(f"/api/users/{a_user.id}")
    assert response.status_code == 200
    assert response.json()["email"] == a_user.email


def test_get_user_404_when_missing(client):
    response = client.get("/api/users/9999")
    assert response.status_code == 404
