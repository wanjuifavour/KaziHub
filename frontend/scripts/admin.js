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
        const response = await fetch('http://localhost:3000/employees');
        const employees = await response.json()
        getEmployees(employees)
    } catch (error) {
        console.error("Error fetching employees:", error);
        showToast("Failed to fetch employees. Please try again.", "error");
    }
}
const getEmployees = (employees) => {
    const displayEmployees = document.getElementById('all-employees');
    let output = '';
    employees.forEach(({id, profilePic, name, email, department, position, phoneNumber, salary }) => {
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
                    <div class="admin-actions">
                        <button class="edit" 
                            data-id="${id}" 
                            data-name="${name}" 
                            data-imageurl="${profilePic}" 
                            data-department="${department}" 
                            data-position="${position}" 
                            data-email="${email}"
                            data-phone="${phoneNumber}"
                            data-salary="${salary}">Edit
                        </button>
                          <button type="button" class="delete" data-id="${id}">Delete</button>
                    </div>
                </div>
            </div>
        `;
    });
    displayEmployees.outerHTML = output;
    const deleteButtons = document.querySelectorAll('.delete');
    deleteButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            const employeeId = event.target.dataset.id;
            showDeleteConfirmation(employeeId);
        });
    });
};

const deleteEmployee = async(employeeId) => {
    try {
        const response = await fetch(`http://localhost:3000/employees/${employeeId}`, {
            method: 'DELETE'
        })
        if(response.ok){
            displayMessage('Employee deleted successfully')
            fetchEmployees()
        }else{
            displayMessage('Failute to delete employee', true)
        }
    } catch (error) {
        console.log(error)
    }
}
const deleteConfirmationPopup = document.querySelector('#delete-confirmation-popup')
const confirmDeleteButton = document.querySelector("#confirm-delete");
const cancelDeleteButton = document.querySelector("#cancel-delete");
let deleteEmployeeId = null;

const showDeleteConfirmation = (employeeId) => {
    deleteEmployeeId = employeeId
    deleteConfirmationPopup.style.display = 'flex'
}
confirmDeleteButton.onclick = () => {
    if(deleteEmployeeId){
        deleteEmployee(deleteEmployeeId)
        deleteConfirmationPopup.style.display = 'none'
        deleteEmployeeId = null
    }
}
cancelDeleteButton.onclick = () => {
    deleteConfirmationPopup.style.display = 'none'
    deleteEmployeeId = null
}
const messageElement = document.getElementById("message");
  
const displayMessage = (message, isError = false) => {
    messageElement.textContent = message;
    messageElement.style.display = "block";
    if (isError) {
        messageElement.classList.remove("success");
        messageElement.classList.add("error");
    } else {
        messageElement.classList.remove("error");
        messageElement.classList.add("success");
    }  
};  
// function checkForm(formId) {
//     const form = document.getElementById(formId);
//     const inputs = form.querySelectorAll("input");
//     for (const input of inputs) {
//       if (input.value.trim() === "") {
//         displayMessage("Please fill in all fields", true);
//         return false;
//       }
//     }
//     return true;
// }  

const popupForm = document.querySelector('#popup-form')
const addNewEmployeeButton = document.querySelector('#addEmployeeBtn')
addNewEmployeeButton.addEventListener('click', () => {
    popupForm.style.display = 'flex'
})
const addNewEmployee = document.querySelector('#popup-form')
const closeAddNewEmployee = document.getElementById('close-popup')
closeAddNewEmployee.addEventListener('click', () => {
    popupForm.style.display = 'none'
})
const employeeForm = document.getElementById('dataForm')
employeeForm.addEventListener('submit', (e) =>{
    e.preventDefault()
        const name = document.getElementById('name').value
        const profilePic = document.getElementById('imageUrl').value
        const department = document.getElementById('department').value
        const position = document.getElementById('position').value
        const email = document.getElementById('email').value
        const phoneNumber = document.getElementById('phone').value
        const salary = document.getElementById('salary').value
        const employee = {name, profilePic, department, position, email, phoneNumber, salary}
        createNewEmployee(employee)
        employeeForm.reset()

    document.getElementById('popup-form').style.display = 'none'
})
const createNewEmployee = async(employee) => {
    try {
        const response = await fetch("http://localhost:3000/employees", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(employee)
        })
        const newEmployee = await response.json()
        console.log(newEmployee)
        displayMessage("Employee added successfully.");
        fetchEmployees()
    } catch (error) {
        console.log(error)
        displayMessage("Error adding employee.", true);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const closeEditPopup = document.getElementById('close-edit-popup')
    const editDataForm = document.getElementById("editDataForm");
    const editPopupForm = document.getElementById("edit-popup-form"); 
    if (!closeEditPopup) {
        console.error("Close button not found");
      } else {
        console.log("Close button found");
      }
    
      closeEditPopup.addEventListener("click", () => {
        console.log("Close button clicked");
        editPopupForm.style.display = "none";
    });
    document.body.addEventListener('click', (e) => {
        if(e.target.classList.contains('edit')){
            const {id, imageurl: profilePic, name, email, department, position, phone: phoneNumber, salary} = e.target.dataset

            document.getElementById("edit-name").value = name
            document.getElementById("edit-imageUrl").value = profilePic
            document.getElementById("edit-department").value = department
            document.getElementById("edit-position").value = position
            document.getElementById("edit-email").value = email
            document.getElementById("edit-phone").value = phoneNumber
            document.getElementById("edit-salary").value = salary

            editDataForm.dataset.id = id
            editPopupForm.style.display ='flex'
        }
    })
    editDataForm.addEventListener('submit',  async(e) => {
        e.preventDefault()
        const id = editDataForm.dataset.id;
        if (!id) {
        return;
        }
        const formData = new FormData(editDataForm);
        const updatedEvent = {};
        formData.forEach((value, key) => {
        updatedEvent[key] = value;
        });
        try {
            const response = await fetch(`http://localhost:3000/employees/${id}`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedEvent),
            })
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                displayMessage("Employee updated successfully.");
                fetchEmployees();
                editPopupForm.style.display = "none";
            } else {
                const error = await response.json();
                displayMessage(`Error: ${error.message}`, true);    
            }
        } catch (error) {
            console.error("Error updating event:", error);
        }
    })

})
fetchEmployees()
