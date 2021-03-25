const EMAIL = document.querySelector("#email");
const PASS = document.querySelector("#pass");
const BTN = document.querySelector("#signup");
const LOGIN = document.querySelector("#login")

BTN.addEventListener("click", () => signip());

function signip() {
    const options = { 
      method: 'POST',
      body: JSON.stringify({user: EMAIL.value, pass:PASS.value }),
      headers:{'Content-Type': 'application/json'}
    }
    fetch("/user/create", options)
        .then(response => {
            if (response.status === 200) {
                alert("New user added")
            }
            else if (response.status === 400) {
                alert("User already exist")
            }
            else if (response.status === 406) {
                alert("Mail/Pass inválidos")
            }
            else {
                alert("No se que va mal...")
            }
        })
        .catch(err => console.log(err))
  }