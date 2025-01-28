const messageInput = document.querySelector('.input input');
const sendButton = document.querySelector('.input button');
const messagesContainer = document.querySelector('.messages');
const logoutButton = document.getElementById('logoutBtn');
const searchInput = document.querySelector('.search input');

const apiURL = "http://localhost:8500/messages";
const usersURL = "http://localhost:8500/api/employees";

async function fetchMessages() {
    try {
        const response = await fetch(apiURL);
        const messages = await response.json();

        const groupedMessages = {};
        messages.forEach((message) => {
            if (!groupedMessages[message.receiver]) {
                groupedMessages[message.receiver] = [];
            }
            groupedMessages[message.receiver].push(message);
        });

        return groupedMessages;
    } catch (error) {
        console.error("Error fetching messages:", error);
        return {};
    }
}

async function fetchUsers() {
    try {
        const response = await fetch(usersURL);
        const users = await response.json();
        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

async function postMessage(messageData) {
    try {
        const response = await fetch(apiURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(messageData),
        });

        if (!response.ok) {
            throw new Error("Failed to post message to the server.");
        }

        return await response.json();
    } catch (error) {
        console.error("Error posting message:", error);
    }
}

function loadChatMessages(chatName, chatsData) {
    messagesContainer.innerHTML = '';
    const messages = chatsData[chatName] || [];
    messages.forEach((message) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = `
            <p><span class="sender">${message.sender}:</span> ${message.message}</p>
        `;
        messagesContainer.appendChild(messageElement);
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendMessage(activeChat, chatsData, event) {
    if (event) event.preventDefault(); // Prevent default form or button behavior

    const messageText = messageInput.value.trim();
    const loggedInUser = JSON.parse(localStorage.getItem('user'));

    if (messageText !== '' && loggedInUser) {
        const newMessage = {
            id: Date.now().toString(),
            sender: loggedInUser.name,
            receiver: activeChat,
            message: messageText,
            time: new Date().toLocaleTimeString(),
        };

        if (!chatsData[activeChat]) {
            chatsData[activeChat] = [];
        }

        chatsData[activeChat].push(newMessage);

        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = `
            <p><span class="sender">You:</span> ${messageText}</p>
        `;
        messagesContainer.appendChild(messageElement);

        await postMessage(newMessage);
        messageInput.value = '';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function handleChatClick(event, chatsData) {
    const chatItems = document.querySelectorAll('.chats li');
    chatItems.forEach((item) => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    const chatName = event.currentTarget.querySelector('span').textContent;
    loadChatMessages(chatName, chatsData);
    return chatName;
}

function updateSidebar(users) {
    const chatsList = document.querySelector('.chats');
    chatsList.innerHTML = '';

    users.forEach(user => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <img src="${user.profilePic}" alt="User Picture">
            <span>${user.name}</span>
        `;
        listItem.addEventListener('click', (event) => {
            handleChatClick(event, {});
        });
        chatsList.appendChild(listItem);
    });
}

function updateUserProfile(user) {
    const userProfile = document.getElementById('user-profile');
    userProfile.innerHTML = `
        <img src="${user.profilePic}" alt="Profile Picture">
        <h3>${user.name}</h3>
    `;
}

async function init() {
    const chatsData = await fetchMessages();
    const users = await fetchUsers();

    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (loggedInUser) {
        updateUserProfile(loggedInUser);
        updateSidebar(users);
    }

    let activeChat = '';
    const chatItems = document.querySelectorAll('.chats li');
    if (chatItems.length > 0) {
        chatItems[0].classList.add('active');
        activeChat = chatItems[0].querySelector('span').textContent;
        loadChatMessages(activeChat, chatsData);

        chatItems.forEach((chat) => {
            chat.addEventListener('click', (event) => {
                activeChat = handleChatClick(event, chatsData);
            });
        });

        sendButton.addEventListener('click', (event) => sendMessage(activeChat, chatsData, event));
        messageInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                sendMessage(activeChat, chatsData, event);
            }
        });
    }

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.replace("../index.html");
    });

    searchInput.addEventListener('input', async () => {
        const searchTerm = searchInput.value.toLowerCase();
        const allUsers = await fetchUsers();
        const filteredUsers = allUsers.filter(user => user.name.toLowerCase().includes(searchTerm));
        updateSidebar(filteredUsers);
    });
}

init();
