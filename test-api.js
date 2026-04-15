const fetch = require('node-fetch');

async function test() {
    // We register an account
    const email = "test" + Date.now() + "@example.com";
    const res = await fetch('https://gigs-ugkz.onrender.com/api/v1/auth/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password: 'Password123!',
            full_name: 'John Doe Testing',
            role: 'student',
            phone_number: '08012345678'
        })
    });
    const regData = await res.json();
    console.log("Register:", JSON.stringify(regData, null, 2));

    if (!regData.data || !regData.data.email) {
        return; // registration failed
    }

    // Login to get token
    const loginRes = await fetch('https://gigs-ugkz.onrender.com/api/v1/auth/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password: 'Password123!'
        })
    });
    const loginData = await loginRes.json();
    console.log("Login:", JSON.stringify(loginData, null, 2));

    const token = loginData.data?.access;
    if (token) {
        // GET Profile
        const profRes = await fetch('https://gigs-ugkz.onrender.com/api/v1/profile/me/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const profData = await profRes.json();
        console.log("Profile:", JSON.stringify(profData, null, 2));
    }
}
test();
