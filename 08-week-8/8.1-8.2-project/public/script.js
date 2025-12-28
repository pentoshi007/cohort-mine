// Shared API and UI Logic

const API_URL = ''; // Relative path since we're serving from same origin

async function apiCall(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    const res = await fetch(`${API_URL}${endpoint}`, config);
    const json = await res.json();

    if (!res.ok) {
        if (res.status === 401) {
            // Token expired or invalid
            logout();
        }
        throw new Error(json.message || json.error || 'Something went wrong');
    }

    return json;
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

function checkAuth(requiredType = null) {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    if (!token) {
        window.location.href = '/auth.html';
        return;
    }

    if (requiredType && userType !== requiredType) {
        window.location.href = '/'; // Redirect to home if wrong user type
        return;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    window.location.href = '/auth.html';
}

function updateNav() {
    const nav = document.getElementById('navLinks');
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    if (token) {
        if (userType === 'admin') {
            nav.innerHTML = `
                <a href="/admin.html" class="btn btn-outline">Dashboard</a>
                <button onclick="logout()" class="btn btn-outline">Logout</button>
            `;
        } else {
            nav.innerHTML = `
                <a href="/dashboard.html" class="btn btn-outline">My Learning</a>
                <button onclick="logout()" class="btn btn-outline">Logout</button>
            `;
        }
    } else {
        nav.innerHTML = `
            <a href="/auth.html" class="btn btn-primary">Login</a>
        `;
    }
}

// Load courses for landing page
async function loadCourses() {
    try {
        const res = await apiCall('/course/preview');
        const grid = document.getElementById('courseGrid');

        if (res.courses.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">No courses available at the moment.</div>';
            return;
        }

        const userType = localStorage.getItem('userType');

        grid.innerHTML = res.courses.map(course => `
            <div class="card">
                <img src="${course.imageUrl}" alt="${course.title}" class="card-img" onerror="this.src='https://placehold.co/600x400?text=Course'">
                <div class="card-body">
                    <h3 class="card-title">${course.title}</h3>
                    <p class="card-desc">${course.description}</p>
                    <div class="card-footer">
                        <span class="price">$${course.price}</span>
                        ${userType === 'admin'
                ? '<span style="color: var(--text-light); font-size: 0.9rem;">Admin View</span>'
                : `<button class="btn btn-primary" onclick="purchaseCourse('${course._id}')">Buy Now</button>`
            }
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error(err);
        document.getElementById('courseGrid').innerHTML = '<div style="color: red; text-align: center;">Failed to load courses</div>';
    }
}

async function purchaseCourse(courseId) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth.html';
        return;
    }

    try {
        await apiCall('/course/purchase', 'POST', { courseId });
        showToast('Course purchased successfully!', 'success');
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1500);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// Initialize nav on all pages
document.addEventListener('DOMContentLoaded', updateNav);
