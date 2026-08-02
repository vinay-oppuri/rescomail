from fastapi.testclient import TestClient

from app.main import create_app


def test_public_route_contract_is_stable():
    app = create_app()
    routes = {
        (route.path, method)
        for route in app.routes
        for method in (route.methods or set())
    }

    assert ("/parse", "POST") in routes
    assert ("/ats/analyze", "POST") in routes
    assert ("/coldmail/generate", "POST") in routes
    assert ("/health/live", "GET") in routes
    assert ("/health/ready", "GET") in routes


def test_health_endpoint_and_trace_header():
    with TestClient(create_app()) as client:
        response = client.get("/health/live")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert response.headers["X-Trace-Id"]


def test_feature_routes_require_service_authentication():
    with TestClient(create_app()) as client:
        response = client.post(
            "/parse",
            json={
                "resumeId": "resume-1",
                "fileUrl": "https://utfs.io/f/resume.pdf",
                "fileName": "resume.pdf",
            },
        )

    assert response.status_code == 401
    assert response.json() == {"detail": "Unauthorized"}
