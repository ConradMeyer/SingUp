const LOGOUT = document.querySelector(".logout");
const READ = document.querySelector(".private");


LOGOUT.addEventListener("click", () => {
    window.location.href = "http://localhost:8080/login/login.html";
})

READ.addEventListener("click", () => {
    const options = { 
        method: 'GET',
        headers:{
            'Content-Type': 'application/json',
            'Authentication': 'token'}
      }
      fetch("/user/read", options)
          .then(response => {
              if (response) {
                // printPrivate()
              }
              else {
                  alert("No se que va mal...")
              }
          })
          .catch(err => console.log(err))
})