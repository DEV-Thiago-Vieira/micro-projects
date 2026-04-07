const usernameField = document.getElementById("username");
const passwordField = document.getElementById("password");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = usernameField.value;
  const password = passwordField.value;
  login(username, password);
});

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = usernameField.value;
  const password = passwordField.value;
  const role = document.getElementById("role").value;
  signUp(username, password, role);
});

function login(username, password) {
  const url = "http://localhost:8080/auth/login";
  const data = {
    login: username,
    password: password,
  };

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => console.log(result))
    .catch((error) => console.error("Error: ", error));
}

function signUp(username, password, role) {
  const url = "http://localhost:8080/auth/register";
  const data = {
    login: username,
    password: password,
    role: role,
  };

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => console.log(result))
    .catch((error) => console.error("Error: ", error));
}
