// donate.js
document.addEventListener("DOMContentLoaded", () => {
    const donationList = document.getElementById("donationItemsList");
    const ngoDirectory = document.getElementById("ngoDirectory");

    // 1. FULL NGO DATA (Restored)
    const ngos = [
        { name: "Matruchhaya Charitable Trust", address: "Vadgaon Sheri, Pune - 411014", email: "matruchhaya.sewa@yahoo.co.in", phone: "020-32318190", lat: 18.5519, lng: 73.9333 },
        { name: "CRY (Child Rights and You)", address: "Sane Guruji Marg, Mumbai – 400011", email: "writetous@crymail.org", phone: "9115911500", lat: 18.9822, lng: 72.8335 },
        { name: "Royal Rose Foundation", address: "Pimple Gurav, Pune - 411061", email: "info@rose.org.in", phone: "9850133983", lat: 18.5905, lng: 73.8055 },
        { name: "Apala Ghar Ashram", address: "Charholi Budruk, Pimpri-Chinchwad, 412105", email: "rajheev@majhaghar.org", phone: "9822217370", lat: 18.6366, lng: 73.8767 },
        { name: "Jivhala Old Age Home", address: "Baner, Pune", email: "jivhalaoldagehome@gmail.com", phone: "8788286727", lat: 18.5590, lng: 73.7868 },
        { name: "Mauli Seva Shushrusha Kendra", address: "Dhankawadi, Pune - 411043", email: "info@mauliseva.com", phone: "9763536678", lat: 18.4636, lng: 73.8542 },
        { name: "Janaseva Foundation", address: "Navi Peth, Pune - 411030", email: "janasevafoundationpune@gmail.com", phone: "20-24538787", lat: 18.5085, lng: 73.8443 },
        { name: "Nanhi Kali", address: "Mumbai 400001 (Main Office)", email: "support@nanhikali.org", phone: "22 6897 5500", lat: 18.9220, lng: 72.8347 },
        { name: "Akshaya Patra Foundation", address: "Senapati Bapat Rd, Pune", email: "contact@akshayapatra.org", phone: "1800-425-8125", lat: 18.5323, lng: 73.8329 }
    ];

    // Render NGO Directory
    if (ngoDirectory) {
        ngoDirectory.innerHTML = "";
        ngos.forEach(ngo => {
            ngoDirectory.innerHTML += `
                <div class="ngo-card">
                    <h4>${ngo.name}</h4>
                    <p style="color: #94a3b8; font-size: 0.9rem;">📍 ${ngo.address}</p>
                    <div style="margin-top: 10px;">
                        <a href="tel:${ngo.phone}" style="margin-right: 15px;">📞 Call</a>
                        <a href="mailto:${ngo.email}">📧 Email</a>
                    </div>
                </div>
            `;
        });
    }

    initMap(ngos);

    // 2. Render Donation Items
    firebase.auth().onAuthStateChanged(user => {
        if (!user) return; 

        db.ref(`foodItems/${user.uid}`).on("value", (snapshot) => {
            if (!donationList) return;
            donationList.innerHTML = ""; 
            
            if (!snapshot.exists()) {
                donationList.innerHTML = "<p style='color:#94a3b8;'>Your inventory is empty.</p>";
                return;
            }

            const data = snapshot.val();
            const today = new Date();
            let hasDonations = false;

            Object.keys(data).forEach(key => {
                const item = data[key];
                const diffDays = Math.ceil((new Date(item.expiryDate) - today) / (86400000));

                // Logic: Show item if expiring in 7 days AND status is available
                if (diffDays > 0 && diffDays <= 7 && item.status === 'available') {
                    hasDonations = true;
                    
                    // NEW: Get Icon based on unit
                    const icon = getCategoryIcon(item.quantity);

                    const card = document.createElement("div");
                    card.classList.add("item-card"); 
                    card.style.border = "1px solid #fbbf24"; 

                    card.innerHTML = `
                        <div class="status-badge badge-soon">Donate Me</div>
                        <div style="font-size: 3rem;">${icon}</div>
                        <h3>${item.name}</h3>
                        <p style="color: #f43f5e; font-weight: bold;">Expires in: ${diffDays} days</p>
                        <p style="color: #94a3b8;">Qty: ${item.quantity}</p>
                        
                        <div class="card-actions">
                             <button class="btn-icon" style="background: #fbbf24; color: #000; width:100%; justify-content:center;" onclick="markDonated('${key}')">
                                🤝 Confirm Donation
                             </button>
                        </div>
                    `;
                    donationList.appendChild(card);
                }
            });
            
            if (!hasDonations) {
                donationList.innerHTML = "<p style='color:#94a3b8;'>✅ No surplus food expiring soon.</p>";
            }
        });
    });
});

// --- HELPER: GET ICON BY UNIT (Smart Logic) ---
function getCategoryIcon(qty) {
    if (!qty) return "🥡";
    const s = qty.toLowerCase();

    // Liquid Check
    if (/(?:^|[\d\s])(l|ml|lits|liters|liter|mililiters)(?:$|[\s\.])/i.test(s)) {
        return "🧃"; 
    }
    // Weight Check
    if (/(?:^|[\d\s])(kg|g|mg|killograms|kilograms|grams)(?:$|[\s\.])/i.test(s)) {
        return "🍱"; 
    }
    // Default
    return "🥡"; 
}

function markDonated(key) {
    const user = firebase.auth().currentUser;
    if(user) {
        db.ref(`foodItems/${user.uid}/${key}`).update({ status: "donated" })
          .then(() => alert("Thank you! Item marked as donated."));
    }
}

function initMap(ngos) {
    const defaultLat = 18.5204;
    const defaultLng = 73.8567;
    const map = L.map('map').setView([defaultLat, defaultLng], 11);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    ngos.forEach(ngo => {
        if (ngo.lat && ngo.lng) {
            L.marker([ngo.lat, ngo.lng]).addTo(map)
                .bindPopup(`<b>${ngo.name}</b><br>${ngo.address}`);
        }
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const redIcon = new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });
            L.marker([lat, lng], {icon: redIcon}).addTo(map).bindPopup("<b>📍 You</b>");
            map.setView([lat, lng], 10);
        });
    }
}