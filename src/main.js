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
  return fetch(`https://hacker-news.firebaseio.com/v0/${selectType}.json`).then(response => response.json()).then((data) => {
    console.log(data)
    return data;
  })
}




function ponerHistorias() {
  stories.textContent = ""
  let arraydeid = []
  pillarHistorias().then(data => {
    let prueba = contador
    let numero = contador + 10;

    for (let i = prueba; prueba < numero; prueba++) {
      const element = data[prueba];
      arraydeid.push(element)
    }
    console.log(arraydeid)
    arraydeid.forEach(element => {
      fetch(`https://hacker-news.firebaseio.com/v0/item/${element}.json`).then(response => response.json())
        .then((data) => {
          let a = document.createElement("a")
          let div = document.createElement("div")
          a.textContent =data.title;
          a.setAttribute('href',data.url)
          div.classList.add("story")
          div.appendChild(a)
          stories.appendChild(div)
        })
    });

  })
}