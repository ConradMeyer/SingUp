const EMAIL = document.querySelector("#email");
const PASS = document.querySelector("#pass");
const BTN = document.querySelector("#signup");
const LOGIN = document.querySelector("#login")

BTN.addEventListener("click", () => signin());

function signin() {
    const options = { 
      method: 'POST',
      body: JSON.stringify({user: EMAIL.value, pass:PASS.value }),
      headers:{'Content-Type': 'application/json'}
    }
    fetch("/user/login", options)
        .then(response => {
            if (response.status === 200) {
                window.location.href = "http://localhost:8080/welcome/welcome.html"
                console.log(response);
                // sessionStorage
            }
            else if (response.status === 401) {
                alert("Email o contraseña incorrect@s")
                console.log(response);
                // sessionStorage
            }
            else if (response.status === 400) {
                alert("Email no valido")
            }
            else {
                alert("No se que va mal...")
            }
        })
        .catch(err => console.log(err))
  }