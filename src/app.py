"""
High School Management System API

A super simple FastAPI application that allows students to view and sign up
for extracurricular activities at Mergington High School.
"""

import os
from pathlib import Path
from typing import Dict, List

from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, validator


class SignupRequest(BaseModel):
    email: str

    @validator("email")
    def validate_email(cls, value: str) -> str:
        value = value.strip().lower()
        if not value.endswith("@mergington.edu"):
            raise ValueError("Email must use the @mergington.edu domain")
        if "@" not in value or value.count("@") != 1:
            raise ValueError("Invalid email address")
        local_part = value.split("@")[0]
        if not local_part or local_part.startswith(".") or local_part.endswith("."):
            raise ValueError("Invalid email address")
        return value


class Activity(BaseModel):
    name: str
    description: str
    schedule: str
    max_participants: int
    participants: List[str]

    @property
    def spots_left(self) -> int:
        return self.max_participants - len(self.participants)

    @property
    def participant_count(self) -> int:
        return len(self.participants)

    def summary(self) -> Dict[str, object]:
        return {
            "name": self.name,
            "description": self.description,
            "schedule": self.schedule,
            "max_participants": self.max_participants,
            "participant_count": self.participant_count,
            "spots_left": self.spots_left,
            "participants": self.participants,
        }


app = FastAPI(
    title="Mergington High School API",
    description="API for viewing and signing up for extracurricular activities",
)

# Mount the static files directory
app.mount(
    "/static",
    StaticFiles(directory=Path(__file__).parent / "static"),
    name="static",
)

# In-memory activity database
activity_data = {
    "Chess Club": {
        "description": "Learn strategies and compete in chess tournaments",
        "schedule": "Fridays, 3:30 PM - 5:00 PM",
        "max_participants": 12,
        "participants": ["michael@mergington.edu", "daniel@mergington.edu"],
    },
    "Programming Class": {
        "description": "Learn programming fundamentals and build software projects",
        "schedule": "Tuesdays and Thursdays, 3:30 PM - 4:30 PM",
        "max_participants": 20,
        "participants": ["emma@mergington.edu", "sophia@mergington.edu"],
    },
    "Gym Class": {
        "description": "Physical education and sports activities",
        "schedule": "Mondays, Wednesdays, Fridays, 2:00 PM - 3:00 PM",
        "max_participants": 30,
        "participants": ["john@mergington.edu", "olivia@mergington.edu"],
    },
}

activities: Dict[str, Activity] = {
    name: Activity(name=name, **details) for name, details in activity_data.items()
}


@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")


@app.get("/activities")
def get_activities():
    return [activity.summary() for activity in activities.values()]


@app.get("/activities/{activity_name}")
def get_activity(activity_name: str):
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activities[activity_name].summary()


@app.post("/activities/{activity_name}/signup")
def signup_for_activity(activity_name: str, signup: SignupRequest):
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")

    activity = activities[activity_name]

    if activity.spots_left <= 0:
        raise HTTPException(status_code=400, detail="This activity is already full")

    if signup.email in activity.participants:
        raise HTTPException(status_code=400, detail="This student is already signed up")

    activity.participants.append(signup.email)
    return {
        "message": f"Signed up {signup.email} for {activity_name}",
        "activity": activity.summary(),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
