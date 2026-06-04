document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Global function attached to window so the inline onclick triggers can access it
  window.unregisterParticipant = async (activityName, email) => {
    try {
      // Assuming standard API routes; adjusts if your backend endpoint looks slightly different
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/unregister`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage("Successfully unregistered!", "success");
        await fetchActivities(); // Refresh UI instantly
      } else {
        showMessage(result.detail || "Could not unregister student.", "error");
      }
    } catch (error) {
      showMessage("Connection error while attempting to unregister.", "error");
      console.error("Error unregistering:", error);
    }
  };

  function showMessage(text, type = "info") {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove("hidden");

    clearTimeout(showMessage.timeoutId);
    showMessage.timeoutId = setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      if (activities.length === 0) {
        activitiesList.innerHTML = "<p>No activities are available at the moment.</p>";
        return;
      }

      activities.forEach((activity) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        // Generate the HTML for the participant elements (hidden bullets style)
        let participantsHtml = "";
        if (activity.participants && activity.participants.length > 0) {
          participantsHtml = `
            <div class="participants-section" style="margin-top: 12px;">
              <strong>Participants:</strong>
              <ul style="list-style-type: none; padding-left: 0; margin-top: 5px;">
                ${activity.participants
                  .map(
                    (email) => `
                  <li style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-size: 0.9em;">
                    <span>${email}</span>
                    <button 
                      onclick="window.unregisterParticipant('${activity.name}', '${email}')" 
                      style="background: none; border: none; cursor: pointer; color: #ff4d4d; font-size: 1.1em; padding: 0 4px;"
                      title="Unregister Student"
                    >
                      ❌
                    </button>
                  </li>
                `
                  )
                  .join("")}
              </ul>
            </div>
          `;
        } else {
          participantsHtml = `
            <div class="participants-section" style="margin-top: 12px; font-size: 0.9em; color: #777;">
              <em>No students enrolled yet.</em>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <div class="activity-header">
            <h4>${activity.name}</h4>
            <span class="status ${activity.spots_left === 0 ? "full" : "open"}">${
          activity.spots_left === 0 ? "Full" : `${activity.spots_left} spots left`
        }</span>
          </div>
          <p>${activity.description}</p>
          <p><strong>Schedule:</strong> ${activity.schedule}</p>
          <p><strong>Students enrolled:</strong> ${activity.participant_count}</p>
          ${participantsHtml}
        `;

        activitiesList.appendChild(activityCard);

        const option = document.createElement("option");
        option.value = activity.name;
        option.textContent = `${activity.name} ${activity.spots_left === 0 ? "(Full)" : ""}`;
        option.disabled = activity.spots_left === 0;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const activity = document.getElementById("activity").value;

    if (!email) {
      showMessage("Please enter your school email.", "error");
      return;
    }

    const emailPattern = /^[^@\s]+@mergington\.edu$/i;
    if (!emailPattern.test(email)) {
      showMessage("Please use a valid @mergington.edu email address.", "error");
      return;
    }

    if (!activity) {
      showMessage("Please select an activity to sign up for.", "error");
      return;
    }

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        signupForm.reset();
        await fetchActivities(); // Updates instantly without hard refresh
      } else {
        showMessage(result.detail || "An error occurred while signing up.", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please check your connection and try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  fetchActivities();
});