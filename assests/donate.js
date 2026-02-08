<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Donate Food</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

<header class="navbar">
  <h1>🍱 Smart Food Inventory</h1>
  <nav id="mainNav"></nav>
</header>

<div class="items-container">
  <h2>Donation Recommendations</h2>

  <!-- 🔑 REQUIRED for donate.js -->
  <div id="donationItemsList" class="items-grid">
    <p>Loading donation suggestions...</p>
  </div>

  <h3 style="margin-top:40px;">Nearby NGOs</h3>

  <!-- 🔑 REQUIRED for donate.js -->
  <div id="ngoDirectory" class="ngo-grid"></div>
</div>

<footer>
  <p>© 2025 Smart Food Inventory</p>
</footer>

<!-- Firebase -->
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js"></script>

<script src="firebase.js"></script>
<script src="auth.js"></script>
<script src="nav.js"></script>
<script src="donate.js"></script>

</body>
</html>
