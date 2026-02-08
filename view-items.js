// view-items.js
document.addEventListener("DOMContentLoaded", () => {
    const itemsList = document.getElementById("itemsList");
    const userProfileSection = document.getElementById("userProfileSection");
    const displayPantryName = document.getElementById("displayPantryName");
    const displayLocation = document.getElementById("displayLocation");
    
    firebase.auth().onAuthStateChanged(user => {
        if (!user) return;

        // 1. SHOW PROFILE & START GPS
        if(userProfileSection) {
            userProfileSection.style.display = "flex";
            startLocationService(user.uid);
        }

        // 2. FETCH PROFILE
        db.ref(`users/${user.uid}/profile`).on("value", (snapshot) => {
            const profile = snapshot.val();
            if (profile) {
                if(profile.pantryName) displayPantryName.textContent = `Welcome, ${profile.pantryName}`;
                if(profile.locationName) displayLocation.innerHTML = `📍 ${profile.locationName}`;
            }
        });

        // 3. FETCH INVENTORY
        const userItemsRef = db.ref(`foodItems/${user.uid}`);
        
        userItemsRef.on("value", (snapshot) => {
            itemsList.innerHTML = ""; 
            
            if (!snapshot.exists()) {
                itemsList.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 50px; background: rgba(255,255,255,0.05); border-radius: 20px;">
                        <div style="font-size: 3rem;">📭</div>
                        <h3>Your Pantry is Empty</h3>
                        <p>Click "Add Item" to start tracking.</p>
                    </div>`;
                return;
            }

            const data = snapshot.val();
            const today = new Date();

            Object.keys(data).forEach((key) => {
                const item = data[key];
                const expiryDate = new Date(item.expiryDate);
                const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                
                // STATUS BADGE LOGIC
                let badgeClass = "badge-available";
                let badgeText = "Fresh";

                if (diffDays <= 0) {
                    badgeClass = "badge-expired";
                    badgeText = "Expired";
                } else if (diffDays <= 3) {
                    badgeClass = "badge-soon";
                    badgeText = "Expiring Soon";
                } else {
                    badgeText = `${diffDays} Days Left`;
                }

                // ICON LOGIC (Based on Quantity)
                const icon = getCategoryIcon(item.quantity);

                const card = document.createElement("div");
                card.classList.add("item-card");
                
                card.innerHTML = `
                    <div class="status-badge ${badgeClass}">${badgeText}</div>
                    <div style="font-size: 3rem; margin-bottom: -10px;">${icon}</div>
                    <h3>${item.name}</h3>
                    
                    <div style="margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                        <p>📦 <strong>Qty:</strong> ${item.quantity}</p>
                        <p>📅 <strong>Expires:</strong> ${item.expiryDate}</p>
                    </div>
                    
                    <div class="card-actions">
                        <button class="btn-icon btn-utilize" onclick="markUtilized('${key}')" 
                          ${item.status === "utilized" ? "disabled" : ""}>
                          ${item.status === "utilized" ? "Done ✓" : "✅ Utilize"}
                        </button>

                        <button class="btn-icon btn-delete" onclick="deleteItem('${key}')">
                          🗑️ Delete
                        </button>
                    </div>
                `;
                itemsList.appendChild(card);
            });
        });
    });
});

// --- HELPER: GET ICON BY UNIT ---
function getCategoryIcon(qty) {
    if (!qty) return "🥡";
    const s = qty.toLowerCase();

    // Liquid Check (l, ml, liters, etc.)
    // Regex checks for the unit preceded by a number/space or at start
    if (/(?:^|[\d\s])(l|ml|lits|liters|liter|mililiters)(?:$|[\s\.])/i.test(s)) {
        return "🧃"; // Liquid Emoji
    }

    // Weight Check (kg, g, mg, etc.)
    if (/(?:^|[\d\s])(kg|g|mg|killograms|kilograms|grams)(?:$|[\s\.])/i.test(s)) {
        return "🍱"; // Solid Food Emoji
    }

    // Default
    return "🥡"; // Generic Takeout Box
}

// --- LOCATION & ACTIONS ---
function startLocationService(uid) {
    const locDisplay = document.getElementById("displayLocation");
    if (!navigator.geolocation) {
        locDisplay.innerHTML = "📍 GPS Not Supported";
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            db.ref(`users/${uid}/profile`).update({ lat, lng });
            
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                .then(r => r.json())
                .then(d => {
                    const a = d.address;
                    const loc = (a.suburb || a.road) + ", " + (a.city || a.town);
                    locDisplay.innerHTML = `📍 ${loc}`;
                    db.ref(`users/${uid}/profile`).update({ locationName: loc });
                })
                .catch(() => locDisplay.innerHTML = `📍 ${lat.toFixed(2)}, ${lng.toFixed(2)}`);
        },
        () => locDisplay.innerHTML = "📍 Location Access Denied",
        { enableHighAccuracy: true }
    );
}

function markUtilized(key) {
    const user = firebase.auth().currentUser;
    if(user) db.ref(`foodItems/${user.uid}/${key}`).update({ status: "utilized" });
}

function deleteItem(key) {
    const user = firebase.auth().currentUser;
    if(user && confirm("Delete this item?")) {
        db.ref(`foodItems/${user.uid}/${key}`).remove();
    }
}