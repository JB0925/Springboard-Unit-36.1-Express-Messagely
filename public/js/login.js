const loginForm = document.querySelector('#loginForm');
const usernameInput = document.querySelector('#username');
const passwordInput = document.querySelector('#password');

console.log('hello')

loginForm.addEventListener('submit', async(evt) => {
    evt.preventDefault();
    const data = {
        username: usernameInput.value,
        password: passwordInput.value
    };

    const resp = await axios.post('http://127.0.0.1:3000/auth/login', data);
    const token = resp.data._token;
    localStorage.setItem("token", JSON.stringify(token));
    
    usernameInput.value = '';
    passwordInput.value = '';
});