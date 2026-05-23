def test_post_rsvp_creates_going_rsvp(client, an_event, another_user):
    response = client.post(
        f"/api/events/{an_event.id}/rsvp",
        headers={"X-User-Id": str(another_user.id)},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["event_id"] == an_event.id
    assert body["user_id"] == another_user.id
    assert body["status"] == "going"


def test_post_rsvp_409_when_already_rsvped(client, an_event, another_user):
    headers = {"X-User-Id": str(another_user.id)}
    first = client.post(f"/api/events/{an_event.id}/rsvp", headers=headers)
    assert first.status_code == 200

    duplicate = client.post(f"/api/events/{an_event.id}/rsvp", headers=headers)
    assert duplicate.status_code == 409


def test_post_rsvp_404_when_event_missing(client, a_user):
    response = client.post(
        "/api/events/9999/rsvp", headers={"X-User-Id": str(a_user.id)}
    )
    assert response.status_code == 404


def test_post_rsvp_401_without_header(client, an_event):
    response = client.post(f"/api/events/{an_event.id}/rsvp")
    assert response.status_code == 401


def test_patch_rsvp_marks_attended_by_attendee(
    client, an_event, another_user
):
    rsvp = client.post(
        f"/api/events/{an_event.id}/rsvp",
        headers={"X-User-Id": str(another_user.id)},
    ).json()

    response = client.patch(
        f"/api/rsvps/{rsvp['id']}",
        json={"status": "attended"},
        headers={"X-User-Id": str(another_user.id)},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "attended"


def test_patch_rsvp_marks_attended_by_host(
    client, an_event, a_user, another_user
):
    rsvp = client.post(
        f"/api/events/{an_event.id}/rsvp",
        headers={"X-User-Id": str(another_user.id)},
    ).json()

    response = client.patch(
        f"/api/rsvps/{rsvp['id']}",
        json={"status": "attended"},
        headers={"X-User-Id": str(a_user.id)},  # a_user is the host of an_event
    )

    assert response.status_code == 200
    assert response.json()["status"] == "attended"


def test_patch_rsvp_403_when_not_owner_or_host(
    client, db_session, an_event, another_user
):
    from models import User

    interloper = User(name="Mallory", email="mallory@example.com")
    db_session.add(interloper)
    db_session.commit()
    db_session.refresh(interloper)

    rsvp = client.post(
        f"/api/events/{an_event.id}/rsvp",
        headers={"X-User-Id": str(another_user.id)},
    ).json()

    response = client.patch(
        f"/api/rsvps/{rsvp['id']}",
        json={"status": "attended"},
        headers={"X-User-Id": str(interloper.id)},
    )

    assert response.status_code == 403
