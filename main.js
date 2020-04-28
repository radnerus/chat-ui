const people = document.getElementById('people');
const loadChats = () => {
    for (let i = 1; i <= 10; i++) {
        const element = document.createElement('div');
        element.className = 'person';
        element.innerHTML = `<img src="./assets/user.svg" alt="user" class="profile-pic">&nbsp;
        Person ${i}`;
        people.appendChild(element);
    }
}