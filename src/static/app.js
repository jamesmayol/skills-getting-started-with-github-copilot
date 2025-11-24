document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();
      
      console.log("Fetched activities:", activities);

      // Clear loading message
      activitiesList.innerHTML = "";
      
      // Clear and reset activity dropdown
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        
        console.log(`${name} has ${details.participants.length} participants:`, details.participants);

        const participantsList = details.participants.length > 0
          ? `<ul class="participants-list">
              ${details.participants.map(participant => `
                <li>
                  ${participant}
                  <button class="delete-btn" data-activity="${name}" data-email="${participant}">❌</button>
                </li>
              `).join('')}
             </ul>`
          : `<p class="no-participants">No participants yet</p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;
        
        // Create participants section separately to ensure it renders
        const participantsDiv = document.createElement("div");
        participantsDiv.className = "participants-section";
        participantsDiv.innerHTML = `
          <p><strong>Current Participants:</strong></p>
          ${participantsList}
        `;
        
        activityCard.appendChild(participantsDiv);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", (event) => {
          const activityName = button.getAttribute("data-activity");
          const participantEmail = button.getAttribute("data-email");
          removeParticipant(activityName, participantEmail);
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Function to remove a participant
  async function removeParticipant(activityName, participantEmail) {
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/remove?email=${encodeURIComponent(participantEmail)}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        fetchActivities(); // Refresh the activities list
      } else {
        console.error("Failed to remove participant");
      }
    } catch (error) {
      console.error("Error removing participant:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh the activities list dynamically
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
