// script.js
// This script handles the submission of a new food item to the database.

document.addEventListener("DOMContentLoaded", () => {
  const foodForm = document.getElementById("foodForm");
  const statusMsg = document.getElementById("statusMsg");

  if (foodForm) {
    foodForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Ensure Firebase is initialized
      if (typeof firebase === 'undefined' || typeof db === 'undefined') {
          statusMsg.textContent = "❌ Error: Firebase not loaded. Check firebase.js";
          return;
      }

      const user = firebase.auth().currentUser;
      
      // Check if user is logged in
      if (!user) {
        statusMsg.textContent = "❌ Error: You must be logged in to add items.";
        return;
      }
      
      const name = document.getElementById("foodName").value.trim();
      const quantity = document.getElementById("quantity").value;
      const expiry = document.getElementById("expiryDate").value;

      if (!name || !quantity || !expiry) {
        statusMsg.textContent = "⚠️ Please fill in all fields.";
        return;
      }

      statusMsg.textContent = "⏳ Saving...";

      // Push data under the user's UID path
      db.ref(`foodItems/${user.uid}`).push({
        name: name,
        quantity: quantity,
        expiryDate: expiry,
        status: "available",
        createdAt: firebase.database.ServerValue.TIMESTAMP
      })
      .then(() => {
        statusMsg.textContent = "✅ Item added successfully! Check View Items.";
        foodForm.reset();
      })
      .catch((error) => {
        console.error("Error adding item:", error);
        // Display specific permission errors if they occur
        if (error.code === 'PERMISSION_DENIED') {
             statusMsg.textContent = "❌ Error: Permission Denied. Check Database Rules.";
        } else {
             statusMsg.textContent = `❌ Error: ${error.message}`;
        }
      });
    });
  }
});