const people = document.getElementById('people');
const sendEle = document.getElementById('send');
const messageEle = document.getElementById('message');
const chats = $('#chats');
const chatsEle = document.getElementById('chats');
const chatPanelEle = document.getElementById('chat-panel');
const form = document.getElementById('message-form');

const loggedInUser = document.getElementById('logged-in-user');
const loggedInUserEmail = document.getElementById('logged-in-email');

const currentChatName = document.getElementById('current-chat-name');
const currentChatEmail = document.getElementById('current-chat-email');

const chatPage = $('#chat-page');
const loginPage = $('#login-page');

const loginForm = $('#login-form');

const socket = io.connect('http://127.0.0.1:4000');

let currentUser = null;
let currentUserIndex = null;
let users = null;
let firstLoad = true;
let currentChatUser = null;

// DOM
const loadChats = () => {
  console.log('Loading chats');
  console.log(users);
  people.innerHTML = '';
  users.forEach((user, index) => {
    if (user.email === currentUser.email) {
      currentUser = user;
      currentUserIndex = index;
      return;
    }

    // console.log(currentUser._id, user._id);

    const element = document.createElement('div');
    element.className = 'person';
    element.id = user.displayName;
    element.onclick = () => openChat(user);
    element.innerHTML = `
        <img src="./assets/user.svg" alt="user" class="profile-pic">&nbsp;
        ${user.displayName}&nbsp;
        <span class="email">${user.email}</span>
    `;
    people.appendChild(element);
  });

  if (firstLoad && users.length > 1) {
    currentChatUser = users[currentUserIndex ? 0 : 1];

    firstLoad = false;
  }
  if (currentChatUser) openChat(currentChatUser);
};

const loadUserChats = (user) => {
  chatsEle.innerHTML = '';
  console.log(user);
  console.log(currentUser.conversations);

  const { conversations } = currentUser;

  if (!conversations) return;

  const thisConversation = conversations.find((conversation) => {
    return conversation.participants.includes(user._id);
  });

  if (!thisConversation) return;

  thisConversation.messages.forEach((message) => {
    const element = document.createElement('div');
    element.className = 'row';
    if (currentUser._id === message.sender) {
      element.innerHTML = `
        <div class="offset-md-6 col-md-6 message-container text-right">
            <span class="message">${message.message}</span>
        </div>
      `;
    } else {
      element.innerHTML = `
        <div class="col-md-6 message-container">
            <span class="message">${message.message}</span>
        </div>
      `;
    }
    chatsEle.appendChild(element);
  });
  chats.animate({ scrollTop: chats[0].scrollHeight }, 100);
};

const openChat = (user) => {
  $('.person').removeClass('active');
  $(`#${user.displayName}`).addClass('active');
  currentChatUser = user;
  currentChatName.innerText = user.displayName;
  currentChatEmail.innerText = user.email;
  loadUserChats(user);
};

$(function () {
  loginForm.validate({
    rules: {
      display_name: 'required',
      email: {
        required: true,
        email: true
      }
    },
    messages: {
      display_name: 'Please enter your Display name',
      email: 'Please enter a valid email address'
    },
    submitHandler: function (_, e) {
      e.preventDefault();
      console.log('submitting');
      if (!loginForm.valid()) return;
      var formData = {};
      $.each(loginForm.serializeArray(), function (i, field) {
        formData[field.name] = field.value;
      });
      currentUser = {
        displayName: formData.display_name,
        email: formData.email
      };
      socket.emit('new-user', currentUser);
    }
  });
});

const login = () => {
  chatPage.show();
  loginPage.hide();
};

const logout = () => {
  chatPage.hide();
  loginPage.show();
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageEle.value;
  if (!message) return;
  console.log(currentChatUser);
  const element = document.createElement('div');
  element.className = 'row';
  element.innerHTML = `<div class="offset-md-6 col-md-6 message-container text-right">
                                <span class="message">${message}</span>
                            </div>`;

  chats.append(element);
  messageEle.value = '';
  chatPanelEle.scrollTop = chatPanelEle.scrollHeight;
  chats.animate({ scrollTop: chats[0].scrollHeight }, 100);
  socket.emit('message', {
    to: currentChatUser._id,
    from: currentUser._id,
    message: message
  });
});

// Socket
if (socket) {
  console.log('Connect to chat socket');

  socket.on('login_success', (_currentUser) => {
    loggedInUser.innerText = currentUser.displayName;
    loggedInUserEmail.innerHTML = currentUser.email;

    loginForm[0].reset();
    login();
  });

  socket.on('users', (userList) => {
    users = userList;
    if (currentUser) loadChats();
  });
}
