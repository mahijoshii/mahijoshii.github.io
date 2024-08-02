document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");

  // Check if form exists
  if (form) {
    form.addEventListener("submit", (e) => {
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const message = document.getElementById("message").value;

      if (!name || !email || !message) {
        e.preventDefault(); // Prevent form submission
        alert("Please fill in all fields.");
      }
    });
  } else {
    console.error("Form with ID 'contact-form' not found.");
  }
});
