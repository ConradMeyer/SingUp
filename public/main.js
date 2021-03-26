const EMAIL = document.querySelector("#email");
const PASS = document.querySelector("#pass");
const NAME = document.querySelector("#name")
const BTN = document.querySelector("#signup");
const LOGIN = document.querySelector("#login")

BTN.addEventListener("click", () => signup());

function signup() {
    const options = { 
      method: 'POST',
      body: JSON.stringify({name: NAME.value, user: EMAIL.value, pass:PASS.value }),
      headers:{'Content-Type': 'application/json'}
    }
    fetch("/user/create", options)
        .then(response => {
            if (response.status === 200) {
                alert("New user added, redirecting to Login")
                setTimeout(function(){ 
                    window.location.href = "http://localhost:8080/login/login.html"
                }, 1000);
            }
            else if (response.status === 400) {
                alert("User already exist, redirecting to Login")
                setTimeout(function(){ 
                    window.location.href = "http://localhost:8080/login/login.html"
                }, 1000);
            }
            else if (response.status === 406) {
                alert("Email or pass no valid")
            }
            else {
                alert("No se que va mal...")
            }
        })
        .catch(err => console.log(err))
  }