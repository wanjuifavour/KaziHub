const messageInput = document.querySelector('.input input');
const sendButton = document.querySelector('.input button');
const messagesContainer = document.querySelector('.messages');
const logoutButton = document.getElementById('logoutBtn');
const chatItems = document.querySelectorAll('.chats li');

const apiURL = "http://localhost:3000/messages";
const usersURL = "http://localhost:3000/employees";

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

async function sendMessage(activeChat, chatsData) {
    const messageText = messageInput.value.trim();

    if (messageText !== '') {
        const newMessage = {
            id: Date.now().toString(), 
            sender: "You", 
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
        chatsList.appendChild(listItem);
    });
}

async function init() {
    const chatsData = await fetchMessages();
    const users = await fetchUsers();
    updateSidebar(users);

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
        sendButton.addEventListener('click', () => sendMessage(activeChat, chatsData));
        messageInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                sendMessage(activeChat, chatsData);
            }
        });
    }

    logoutButton.addEventListener('click', () => {
        // alert('You have logged out.');
        window.location.href = './index.html';
    });
}

init();
