const fetchEmployees = async () => {
    try {
        const response = await fetch('http://localhost:3000/employees');
        const employees = await response.json()
        getEmployees(employees)

    } catch (error) {
        console.log(error)
    }
}

const getEmployees = (employees) => {
    const displayEmployees = document.getElementById('all-employees')
    let output = ''
    employees.forEach(({profilePic, name, email, department, position, phoneNumber, salary }) => {
        output += `
            <div class="container"> 
                <div class="employeeCard">
                    <img src="${profilePic}" alt="${name}">
                    <h2>Name: ${name}</h2>
                    <p>Department: ${department}</p>
                    <p>Position: ${position}</p>
                    <p>Salary: ${salary}</p>
                    <h4>Email: ${email}</h4>
                    <h4>Phone Number: ${phoneNumber}</h4>   
                </div>
            </div>
        `
    })
    displayEmployees.outerHTML = output
}
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
        const response = await fetch('http://localhost:3000/employees', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(employee)
        })
        const newEmployee = await response.json()
        console.log(newEmployee)
        fetchEmployees()
    } catch (error) {
        console.log(error)
    }
}

fetchEmployees()