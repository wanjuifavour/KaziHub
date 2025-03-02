import showToast from '../scripts/toast.js';

const fetchEmployees = async () => {
    try {
        const response = await fetch('http://localhost:8500/api/employees');
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
        const response = await fetch(`http://localhost:8500/api/employees/${employeeId}`, {
            method: 'DELETE'
        })
        if(response.ok){
            showToast('Employee deleted successfully', 'success')
            fetchEmployees()
        }else{
            showToast('Failute to delete employee', 'true')
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
        const response = await fetch("http://localhost:8500/api/employees", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(employee)
        })
        const newEmployee = await response.json()
        console.log(newEmployee)
        showToast("Employee added successfully.", "success");
        fetchEmployees()
    } catch (error) {
        console.log(error)
        showToast("Error adding employee.", "error");
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
            const response = await fetch(`http://localhost:8500/api/employees/${id}`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedEvent),
            })
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                showToast("Employee updated successfully.", "success");
                fetchEmployees();
                editPopupForm.style.display = "none";
            } else {
                const error = await response.json();
                showToast(`Error: ${error.message}`, "error");    
            }
        } catch (error) {
            console.error("Error updating event:", error);
        }
    })
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.replace("./index.html");
        });

})
fetchEmployees()
