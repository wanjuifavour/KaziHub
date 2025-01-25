const fetchEmployees = async () => {
    try {
        const response = await fetch('http://localhost:3000/employees');
        const employees = await response.json()
        getEmployees(employees)
        console.log(getEmployees)
    } catch (error) {
        console.log(error)
    }
}

const getEmployees = (employees) => {
    const displayEmployees = document.getElementById('all-employees')
    let output = ''
    employees.forEach(({profilePic, name, email, department, position, phoneNumber }) => {
        output += `
            <div class="container"> 
                <div class="employeeCard">
                    <img src="${profilePic}" alt="${name}">
                    <h2>${name}</h2>
                    <p>${department}</p>
                    <p>${position}</p>
                    <h4>${email}</h4>
                    <h4>${phoneNumber}</h4>   
                </div>
            </div>
        `
    })
    displayEmployees.outerHTML = output
}
fetchEmployees()