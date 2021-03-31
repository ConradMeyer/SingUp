const LOGOUT = document.querySelector(".logout");
const READ = document.querySelector(".private");
const CAJA = document.querySelector(".main");


LOGOUT.addEventListener("click", () => {
    window.location.href = "http://localhost:8080/login/login.html";

})

READ.addEventListener("click", () => {
    let token = localStorage.getItem("token");

    const options = { 
        method: 'GET',
        headers:{
            'Content-Type': 'application/json',
            'Authentication': token}
      }

      fetch("/user/read", options)
          .then(response => response.json())
          .then(data => pintar(data))
          .catch(err => console.log(err))
})

function pintar(data) {
    let title = document.createElement("h2")
    let contT = document.createTextNode("Here is your secret info:")
    title.appendChild(contT)
    CAJA.appendChild(title)

    let name = document.createElement("h3")
    let contN = document.createTextNode(data.name)
    name.appendChild(contN)
    CAJA.appendChild(name)

    let mail = document.createElement("h3")
    let contM = document.createTextNode(data.user)
    mail.appendChild(contM)
    CAJA.appendChild(mail)

    let secret = document.createElement("h3")
    let contS = document.createTextNode(data.secret)
    secret.appendChild(contS)
    CAJA.appendChild(secret)
}