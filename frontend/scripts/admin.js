import showToast from "./toast";

document.addEventListener("DOMContentLoaded", () => {
    // Fetch and display employees on page load
    fetchEmployees();

    // DOM elements
    const popupForm = document.querySelector("#popup-form");
    const addNewEmployeeButton = document.querySelector("#addEmployeeBtn");
    const closeAddNewEmployee = document.getElementById("close-popup");
    const employeeForm = document.getElementById("dataForm");

    // Show popup form to add a new employee
    addNewEmployeeButton.addEventListener("click", () => {
        popupForm.style.display = "flex";
    });

    // Close popup form
    closeAddNewEmployee.addEventListener("click", () => {
        popupForm.style.display = "none";
    });

    // Handle new employee form submission
    employeeForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const employee = {
            name: document.getElementById("name").value,
            profilePic: document.getElementById("imageUrl").value,
            department: document.getElementById("department").value,
            position: document.getElementById("position").value,
            email: document.getElementById("email").value,
            phoneNumber: document.getElementById("phone").value,
            salary: document.getElementById("salary").value,
        };

        await createNewEmployee(employee);
        employeeForm.reset();
        popupForm.style.display = "none";
    });

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
        showToast('Logged out successfully', 'success');
    });

    // Protect pages based on user roles
    const user = JSON.parse(localStorage.getItem("user"));
    const protectedPages = {
        "admin.html": ["admin"],
        "manager.html": ["manager"],
        "employee.html": ["employee", "manager"],
    };

    const currentPage = window.location.pathname.split("/").pop();

    if (!user || !protectedPages[currentPage]?.includes(user.role.toLowerCase())) {
        window.location.href = "index.html";
    }
});

// Fetch employees from the server
const fetchEmployees = async () => {
    try {
        const response = await fetch("http://localhost:3000/employees");
        const employees = await response.json();
        getEmployees(employees);
    } catch (error) {
        console.error("Error fetching employees:", error);
        showToast("Failed to fetch employees. Please try again.", "error");
    }
};

// Render employee data
const getEmployees = (employees) => {
    const displayEmployees = document.getElementById("all-employees");
    let output = "";

    employees.forEach(({ profilePic, name, email, department, position, phoneNumber, salary }) => {
        output += `
            <div class="container">
                <div class="employeeCard">
                    <img src="${profilePic}" alt="${name}">
                    <h2>Name: ${name}</h2>
                    <p>Department: ${department}</p>
                    <p>Position: ${position}</p>
                    <p>Salary: $${salary}</p>
                    <h4>Email: ${email}</h4>
                    <h4>Phone Number: ${phoneNumber}</h4>
                </div>
            </div>
        `;
    });

    displayEmployees.innerHTML = output;
};

// Add a new employee to the server
const createNewEmployee = async (employee) => {
    try {
        const response = await fetch("http://localhost:3000/employees", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(employee),
        });

        if (response.ok) {
            const newEmployee = await response.json();
            console.log("New employee added:", newEmployee);
            showToast("Employee added successfully", "success");
            fetchEmployees(); // Refresh employee list
        } else {
            throw new Error("Failed to add employee.");
        }
    } catch (error) {
        console.error("Error adding employee:", error);
        showToast("Failed to add employee. Please try again.", "error");
    }
};
