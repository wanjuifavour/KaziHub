const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3000/products");
      const products = await response.json();
      getProducts(products);
      console.log(products);
    } catch (error) {
      console.log(error);
    }
  };
  
  const getProducts = (products) => {
    const displayProducts = document.getElementById("all-products");
    let output = "";
    products.forEach(({ id, name, image, price, description }) => {
      output += `
              <div class="container">
                  <div class="products">
                      <img src="${image}" alt="${name}" loading="lazy">
                      <h3>${name}</h3>
                      <p>${price}</p>
                      <div class="admin-actions">
                          <button class="edit" 
                                  data-id="${id}" 
                                  data-name="${name}" 
                                  data-imageurl="${image}" 
                                  data-price="${price}" 
                                  data-description="${description}" >Edit
                          </button>
                          <button type="button" class="delete" data-id="${id}">Delete</button>
                      </div>
                  </div>
              </div>
          `;
    });
    displayProducts.innerHTML = output;
    const deleteButtons = document.querySelectorAll(".delete");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const itemId = event.target.dataset.id;
        showDeleteConfirmation(itemId);
      });
    });
  };
  const deleteConfirmationPopup = document.querySelector(
    "#delete-confirmation-popup"
  );
  const confirmDeleteButton = document.querySelector("#confirm-delete");
  const cancelDeleteButton = document.querySelector("#cancel-delete");
  let deleteItemId = null;
  
  const showDeleteConfirmation = (itemId) => {
    deleteItemId = itemId;
    deleteConfirmationPopup.style.display = "flex";
  };
  
  confirmDeleteButton.onclick = () => {
    if (deleteItemId) {
      deleteItem(deleteItemId);
      deleteConfirmationPopup.style.display = "none";
      deleteItemId = null;
    }
  };
  
  cancelDeleteButton.onclick = () => {
    deleteConfirmationPopup.style.display = "none";
    deleteItemId = null;
  };
  
  const deleteItem = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:3000/products/${itemId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        console.log(`Product with ID ${itemId} deleted successfully.`);
        fetchProducts();
      } else {
        console.error(`Failed to delete habit with ID ${itemId}.`);
      }
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };
  const popupForm = document.querySelector("#popup-form");
  const addProductButton = document.querySelector("#add-product");
  addProductButton.addEventListener("click", () => {
    popupForm.style.display = "flex";
  });
  const addProductPopup = document.querySelector("#popup-form");
  const closeAddProductPopup = document.getElementById("close-popup");
  closeAddProductPopup.addEventListener("click", () => {
    popupForm.style.display = "none";
  });
  const productForm = document.getElementById("dataForm");
  productForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const image = document.getElementById("imageUrl").value;
    const price = document.getElementById("price").value;
    const product = { name, description, image, price };
    createProduct(product);
    productForm.reset();
    document.getElementById("popup-form").style.display = "none";
  });
  const createProduct = async (habit) => {
    try {
      const response = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(habit),
      });
      const newProduct = await response.json();
      console.log(newProduct);
      fetchProducts();
    } catch (error) {
      console.log(error);
    }
  };
  document.addEventListener('DOMContentLoaded', () => {
      const closeEditPopup = document.getElementById('close-edit-popup');
      const editDataForm = document.getElementById('editDataForm');
      const editPopupForm = document.getElementById('edit-popup-form');
  
      if (!closeEditPopup) {
          console.error('Close button not found');
      } else {
          console.log('Close button found'); 
      }
      const editButtons = document.querySelectorAll('.edit');
      if (editButtons.length === 0) {
          console.error("No .edit buttons found on the page");
      } else {
          console.log(`Found ${editButtons.length} .edit buttons`);
      }
  
  
      closeEditPopup.addEventListener('click', () => {
          console.log("Close button clicked");
          editPopupForm.style.display = 'none';
      });
  
      document.body.addEventListener('click', (e) => {
          if (e.target.classList.contains('edit')) {
              console.log('Edit button clicked');
  
              console.log('Before:', editPopupForm.style.display);
  
  
              const { id, name, imageurl, price, description} = e.target.dataset;
  
              document.getElementById('edit-imageUrl').value = imageurl;
              document.getElementById('edit-name').value = name;
              document.getElementById('edit-price').value = price;
              document.getElementById('edit-description').value = description;
  
              editDataForm.dataset.id = id;
  
              editPopupForm.style.display = 'flex';
  
              console.log('After:', editPopupForm.style.display);
          }
      })
      editDataForm.addEventListener('submit', async (e) => {
          e.preventDefault();
  
          const id = editDataForm.dataset.id;
          if (!id) {
              alert('Invalid item. Cannot update.');
              return;
          }
          const formData = new FormData(editDataForm);
          const updatedEvent = {};
          formData.forEach((value, key) => {
              updatedEvent[key] = value;
          });
  
          try {
              const response = await fetch(`http://localhost:3000/products/${id}`, {
                  method: 'PATCH',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(updatedEvent),
              });
  
              if (response.ok) {
                  const data = await response.json();
                  console.log(data)
                  alert('Event updated successfully!');
                  location.reload(); 
              } else {
                  const error = await response.json();
                  alert(`Error: ${error.message}`);
              }
          } catch (error) {
              console.error('Error updating event:', error);
              alert('Failed to update the event. Please try again.');
          }
      });
  
  })
  
  fetchProducts();
  