const botones = document.querySelectorAll(".botones")
const stories = document.querySelector("#stories");
const cosarara = document.querySelector("#prueba")
const anterior = document.querySelector("#anterior")
const siguiente = document.querySelector("#siguiente")
const numeropagina = document.querySelector("#pagina")
//const radiobotones = document.querySelector("#radiobotones")
let contador = 0;
let pagina = 1;
let selectType = "topstories";
/*
radiobotones.forEach((element) , () => {
  element.addEventListener("click" , (element) => {
    console.log(element.id)
  })
})
*/
numeropagina.textContent = pagina;
botones.forEach((element) => {
  element.addEventListener("click", () => {
    botones.forEach((element) => {
      element.classList.remove("activado")
    })
    element.classList.add("activado")
    selectType = pickType( element.textContent);
    ponerHistorias()
  })
})

function pickType(element) {
  if (element == "Top stories") {
    return "topstories"
  } else if(element == "Best stories") {
    return "beststories"
  } else if(element == "New stories") {
    return "newstories"
  
  }
}


ponerHistorias()

siguiente.addEventListener(("click"),() => {
  pagina++;
  numeropagina.textContent = pagina; 
  contador += 10
  console.log(contador)
  ponerHistorias()
})

anterior.addEventListener(("click"),() => {
      contador = contador - 10;
      pagina--;
      numeropagina.textContent = pagina 
      console.log(contador - 10)
  ponerHistorias()
})


async function pillarHistorias() {
  const response = await fetch(`https://hacker-news.firebaseio.com/v0/${selectType}.json`)
  return await response.json()
}



async function ponerHistorias() {
  stories.textContent = ""
  
  const ids = await pillarHistorias()
  console.log(ids)

  
}
  