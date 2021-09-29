const messageForm = document.querySelector('#messageForm');
const fromUser = document.querySelector('#fromUsername');
const toUser = document.querySelector('#toUsername');
const msgBody = document.querySelector('#msgBody');
const usersH2 = document.querySelector('.box-two h2');
const userList = document.querySelector('.user-list');
const boxTwo = document.querySelector('.box-two');
let userNames;

let _token;
let usersShowing = false;

try {
    _token = JSON.parse(localStorage.getItem("token"));
} catch (error) {
    _token = undefined;
};

if (document.querySelectorAll('.user-list p')) {
    userNames = document.querySelectorAll('.user-list p');
    userNames.forEach(n => n.style.display = 'none')
}

messageForm.addEventListener('submit', async(evt) => {
    evt.preventDefault();
    const message = {
        from_username: fromUser.value,
        to_username: toUser.value,
        body: msgBody.value
    };
    
    const resp = await axios.post('http://127.0.0.1:3000/messages', {message, _token});
    fromUser.value = '';
    toUser.value = '';
    msgBody.value = '';

});

usersH2.addEventListener('click', () => {
    if (usersShowing && userNames) {
        userList.style.height = '0px';
        userNames.forEach(n => n.style.display = 'none');
        usersShowing = false;
    } else {
        if (userNames) {
            userList.style.height = '100%';
            userNames.forEach(n => n.style.display = 'block');
            usersShowing = true;
        };
    };
});