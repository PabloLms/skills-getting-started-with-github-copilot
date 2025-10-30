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

      // Clear loading message
      activitiesList.innerHTML = "";

      // Limpiar el select antes de agregar opciones
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Crear lista de participantes con ícono de eliminar
        let participantsList = "";
        if (details.participants.length > 0) {
          participantsList = `
            <div>
              <strong>Participants:</strong>
              <ul>
                ${details.participants.map(email => `
                  <li style="display: flex; align-items: center; gap: 8px;">
                    <span>${email}</span>
                    <span class="delete-participant" title="Eliminar" data-activity="${name}" data-email="${email}" style="cursor:pointer;color:#c62828;font-size:18px;">&#128465;</span>
                  </li>
                `).join("")}
              </ul>
            </div>
          `;
        } else {
          participantsList = `<div><strong>Participants:</strong> <em>No participants yet</em></div>`;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsList}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Delegar evento de eliminar participante de forma global (event delegation)
      activitiesList.onclick = async function(e) {
        const icon = e.target.closest('.delete-participant');
        if (icon) {
          const email = icon.getAttribute('data-email');
          if (confirm(`¿Eliminar a ${email} de la actividad?`)) {
            // Oculta el elemento li del participante
            const li = icon.closest('li');
            if (li) {
              li.style.display = 'none';
              messageDiv.textContent = 'Participante Eliminado.';
              messageDiv.className = 'success';
              messageDiv.classList.remove('hidden');
              setTimeout(() => {
                messageDiv.classList.add('hidden');
              }, 2000);
            }
          }
        }
      };
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
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
