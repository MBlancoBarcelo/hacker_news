const botones = document.querySelectorAll(".botones")

botones.forEach((element) => {
  element.addEventListener("click", () => {
    botones.forEach((element) => {
      element.classList.remove("activado")
    })
    element.classList.add("activado")
  })
})

ponerHistorias()


function pillarHistorias() {
  return fetch ("https://hacker-news.firebaseio.com/v0/topstories.json").then(response => response.json()).then((data) => {
    console.log(data)
    return data;
  })
}


function ponerHistorias(){
const data = pillarHistorias()
  console.log(data)
}