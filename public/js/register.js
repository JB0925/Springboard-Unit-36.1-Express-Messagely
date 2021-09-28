const loginForm = document.querySelector('form');
const usernameInput = document.querySelector('#username');
const passwordInput = document.querySelector('#password');
const firstName = document.querySelector('#firstName');
const lastName = document.querySelector('#lastName');
const phone = document.querySelector('#phone');

let inputs = [usernameInput, passwordInput, firstName, lastName, phone];
let token;

loginForm.addEventListener('submit', async(evt) => {
    evt.preventDefault();
    const data = {
        username: usernameInput.value,
        password: passwordInput.value,
        first_name: firstName.value,
        last_name: lastName.value,
        phone: phone.value
    }
    const resp = await axios.post('http://127.0.0.1:3000/auth/register', data);
    token = resp.data.token;
    localStorage.setItem("token", JSON.stringify(token));
    
    for (let el of inputs) {
        el.value = '';
    }
});