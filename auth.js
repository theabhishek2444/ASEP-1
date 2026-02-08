// auth.js
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const authStatus = document.getElementById('authStatus');
    const signupStatus = document.getElementById('signupStatus');
    const loginSection = document.getElementById('loginSection');
    const signupSection = document.getElementById('signupSection');

    // Toggle Forms
    if (document.getElementById('showSignup')) {
        document.getElementById('showSignup').addEventListener('click', (e) => {
            e.preventDefault();
            loginSection.style.display = 'none';
            signupSection.style.display = 'block';
        });
    }

    if (document.getElementById('showLogin')) {
        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            signupSection.style.display = 'none';
            loginSection.style.display = 'block';
        });
    }

    // SIGN UP LOGIC (UPDATED)
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const pantryName = document.getElementById('pantryName').value; // Get Name

            signupStatus.textContent = 'Processing...';

            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    
                    // SAVE NAME TO DATABASE IMMEDIATELY
                    return db.ref(`users/${user.uid}/profile`).set({
                        pantryName: pantryName,
                        email: email
                    });
                })
                .then(() => {
                    signupStatus.textContent = '✅ Success! Redirecting...';
                    setTimeout(() => window.location.href = 'view-items.html', 1500);
                })
                .catch(err => signupStatus.textContent = `❌ ${err.message}`);
        });
    }

    // LOGIN LOGIC
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            authStatus.textContent = 'Logging in...';

            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    authStatus.textContent = '✅ Success! Redirecting...';
                    setTimeout(() => window.location.href = 'view-items.html', 1000);
                })
                .catch(err => authStatus.textContent = `❌ ${err.message}`);
        });
    }

    // Sign Out
    window.signOutUser = function() {
        auth.signOut().then(() => window.location.href = 'index.html');
    };
});