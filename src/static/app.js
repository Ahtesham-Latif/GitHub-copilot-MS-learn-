document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

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

        // Generate the participants list HTML
        let participantsHtml = '<ul class="participants-list">';
        if (activity.participants && activity.participants.length > 0) {
          activity.participants.forEach((participant) => {
            participantsHtml += `
              <li>
                ${participant} 
                <span class="delete-icon" data-activity="${activity.name}" data-email="${participant}" title="Unregister">🗑️</span>
              </li>`;
          });
        } else {
          participantsHtml += '<li>No participants yet</li>';
        }
        participantsHtml += '</ul>';

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
          <div class="participants-section">
            <strong>Participants:</strong>
            ${participantsHtml}
          </div>
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

  // Handle participant unregistration (Delete icon click)
  activitiesList.addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-icon")) {
      const activityName = event.target.getAttribute("data-activity");
      const email = event.target.getAttribute("data-email");

      try {
        const response = await fetch(
          `/activities/${encodeURIComponent(activityName)}/signup`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );

        const result = await response.json();

        if (response.ok) {
          showMessage(`Unregistered ${email} successfully.`, "success");
          await fetchActivities();
        } else {
          showMessage(result.detail || "An error occurred.", "error");
        }
      } catch (error) {
        showMessage("Failed to unregister. Check your connection.", "error");
        console.error("Error unregistering:", error);
      }
    }
  });

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
        await fetchActivities();
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