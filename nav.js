// nav.js
document.addEventListener("DOMContentLoaded", () => {
    const mainNav = document.getElementById('mainNav');
    
    // Check authentication state
    firebase.auth().onAuthStateChanged(user => {
        if (!mainNav) return;

        // 1. CLEAR & SET DEFAULT LINKS
        mainNav.innerHTML = ''; 
        let menuHTML = '<a href="index.html">Home</a>';

        if (user) {
            // 2. RENDER FEATURE LINKS IMMEDIATELY (Don't wait for DB)
            menuHTML += `
                <a href="add-item.html">Add Item</a>
                <a href="view-items.html">View Items</a>
                <a href="donate.html">Donate</a>
                <a href="compost.html">Compost</a>
            `;

            // 3. ADD NAME PLACEHOLDER & SIGN OUT
            menuHTML += `
                <span id="navPantryName" style="color: #2dd4bf; margin-left: 15px; font-weight: bold; border: 1px solid #2dd4bf; padding: 5px 10px; border-radius: 10px; display: none;">
                    🏨 Loading...
                </span>
                <a href="#" onclick="signOutUser()" style="color: #f43f5e; margin-left: 10px;">Sign Out</a>
            `;
            
            // 4. PAINT THE MENU NOW
            mainNav.innerHTML = menuHTML;

            // 5. FETCH NAME IN BACKGROUND
            const userProfileRef = firebase.database().ref(`users/${user.uid}/profile/pantryName`);
            userProfileRef.once('value').then((snapshot) => {
                const name = snapshot.val();
                const badge = document.getElementById("navPantryName");
                if (name && badge) {
                    badge.innerText = `🏨 ${name}`;
                    badge.style.display = "inline-block"; // Show badge only when name arrives
                }
            });

        } else {
            // Guest View
            menuHTML += '<a href="auth.html" class="btn">Login/Sign Up</a>';
            mainNav.innerHTML = menuHTML;
        }
    });
});

// Global Sign Out Function
window.signOutUser = function() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'index.html';
    });
};