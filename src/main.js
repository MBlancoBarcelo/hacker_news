const botones = document.querySelectorAll(".botones")
const stories = document.querySelector("#stories");
const cosarara = document.querySelector("#prueba")
const anterior = document.querySelector("#anterior")
const siguiente = document.querySelector("#siguiente")
const numeropagina = document.querySelector("#pagina")
let idsnoticias
let contador = 0;
let contador2 = 3;
let pagina = 1;
let selectType = loadLocalSelect();

numeropagina.textContent = pagina;

function showLoader() {
  stories.textContent="";
  let loaderDiv = document.createElement("div")
  loaderDiv.classList.add("loader-container")
  let loader = document.createElement("div")
  loader.classList.add("loader")
  loaderDiv.appendChild(loader)
  stories.appendChild(loaderDiv)
}

function hideLoader() {
  let loader = document.querySelector(".loader-container")
  if(loader){
    loader.remove()
  }
} 

function pressButon() {
  let botoninstorage = localStorage.getItem("selecttype")

  botones.forEach((element) => {
    let botontopress = pickType(element.textContent)
    if (botoninstorage == botontopress) {
      element.classList.add("activado")
    }
  })
}



botones.forEach((element) => {
  element.addEventListener("click", () => {
    botones.forEach((element) => {
      element.classList.remove("activado")
    })
    element.classList.add("activado")
    selectType = pickType(element.textContent);
    localStorage.setItem("selecttype", selectType)
    history.pushState({},"",selectType)
    ponerHistorias()
  })
})

function pickType(element) {
  if (element == "Top stories") {
    return "topstories"
  } else if (element == "Best stories") {
    return "beststories"
  } else if (element == "New stories") {
    return "newstories"

  }
}

pressButon()
ponerHistorias()

siguiente.addEventListener(("click"), () => {
  pagina++;
  numeropagina.textContent = pagina;
  contador += 10
  ponerHistorias()
})

anterior.addEventListener(("click"), () => {
  if (pagina == 1){
    return
  }
  contador = contador - 10;
  pagina--;
  numeropagina.textContent = pagina
  ponerHistorias()
})


async function pillarHistorias() {
  const response = await fetch(`https://hacker-news.firebaseio.com/v0/${selectType}.json`)
  return await response.json()
}



async function ponerHistorias() {
  showLoader()

  idsnoticias = await pillarHistorias()

  const numerodenoticias = idsnoticias.slice(contador, contador + 10)

  const noticias = await Promise.all(
    numerodenoticias.map(id =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(response => response.json())
    )
  )

  const autores = await Promise.all(
    noticias.map(noticia => {
      if (noticia.by) {
        return fetch(`https://hacker-news.firebaseio.com/v0/user/${noticia.by}.json`).then(response => response.json())
      } else {
        return null;
      }
    })

  )

  noticias.forEach((noticia, i) => {
    const autorInfo = autores[i]


    const div = document.createElement("div")
    div.classList.add("story")



    const score = document.createElement("p");
    score.textContent = `Score: ${noticia.score}`;

    const autor = document.createElement("a")
    autor.textContent = `Autor: ${autorInfo.id}`
    autor.addEventListener("click", () => {
      console.log(autorInfo)
      ponerDatosDelAutor(autorInfo)
    })
    const a = document.createElement("a");
    a.textContent = noticia.title;
    a.href = noticia.url;



    const skibidi = document.createElement("a")
    skibidi.textContent = "Numero Comentarios: " + (noticia.kids?.length || 0)
    skibidi.addEventListener("click", () => {
      ponerComentarios(noticia.title, noticia.kids)
    })

    const time = document.createElement("p");

    time.textContent = "Time " + formaterTime(noticia.time)


    hideLoader()
    const divdecontenido = document.createElement("div")
    divdecontenido.classList.add("contenido")

    
    divdecontenido.appendChild(score)
    divdecontenido.appendChild(autor)
    divdecontenido.appendChild(skibidi)
    divdecontenido.appendChild(time)


    div.appendChild(a)
    div.appendChild(divdecontenido)


    stories.appendChild(div)
  })

}

async function ponerComentarios(noticia, kids) {
  if (kids === undefined || kids === 0) {
    return
  }
  let comentariosIds = [];
  for (let index = 0; index < contador2; index++) {
    const element = kids[index];
    comentariosIds.push(element)
  }

  showLoader()

  const texto = document.createElement("div")
  texto.textContent = noticia

  stories.appendChild(texto)

  const comentarios = await Promise.all(
    comentariosIds.map(id => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(response => response.json())
    ))

  comentarios.forEach((comentario, i) => {
    const div = document.createElement("div")
    div.classList.add("story")
    div.textContent = comentario.by
    const p = document.createElement("p")
    p.innerHTML = convertidor( comentario.text)
    const a = document.createElement("p")
    a.textContent = "Numero Comentarios: " + (comentario.kids?.length || 0)
    a.addEventListener(("click"), () => {
      ponerComentarios(comentario.text, comentario.kids)
    })

    hideLoader()

    div.appendChild(p)
    div.appendChild(a)
    stories.appendChild(div)
  })

  let button = document.createElement("button")
  button.textContent = "More"

  button.addEventListener("click", () => {
    contador2 = contador2 + 3
    ponerComentarios(noticia, kids)
  })



  stories.appendChild(button)
}


function ponerDatosDelAutor(autor) {

  showLoader()

  const div = document.createElement("div")
  div.classList.add("story")
  div.textContent = "User: " + autor.id
  

  const fecha = document.createElement("p")
  fecha.textContent = "Created: " + formatedDate(autor.created)

  const karma = document.createElement("p")
  karma.textContent = "Karma: " + autor.karma

  const about = document.createElement("div")


  if (autor.about) {
    about.textContent = "About: " + convertidor(autor.about)
  } else {
    about.textContent = "About:"
  }

  hideLoader()

  console.log(autor.about)

  div.appendChild(fecha)
  div.appendChild(karma)
  div.appendChild(about)

  stories.appendChild(div)
}


function convertidor(frase){
  console.log(frase)
  const txt = document.createElement("textarea");
  txt.innerHTML = frase
  let textolimpio = txt.value
  console.log(textolimpio)
  textolimpio = textolimpio.replace(/<p>/gi, "\n") 
  console.log(textolimpio)

  return textolimpio
}


function loadLocalSelect() {
  let aaa = localStorage.getItem("selecttype")

  return aaa
}


function formatedDate(fecha) {
   let date = new Date(fecha * 1000)
   let mm = String(date.getUTCMonth()+1).padStart(2,'0');
   let dd = String(date.getUTCDate()).padStart(2,'0');
   let yy = String(date.getUTCFullYear());
   dd = Number(dd)
   mm = Number(mm)
   let month = pickMonth(mm)
   console.log(month  + " " + dd + " " +yy)
   return `${month} ${dd} ${yy}`
}

function pickMonth(month ) {
  month = month - 1
let months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

  for(index = 0; index < months.length; index++){
    if(index == month) {
      return months[index]
    }
  }
}



function formaterTime(time) {
  let date = new Date(time * 1000)
  let hours = date.getHours()
  let minutes = "0" + date.getMinutes();
  let formatedTime = hours + ":" + minutes.slice(-2)
  return formatedTime
}

setInterval(async () => {
  let ids = await pillarHistorias()
  if (JSON.stringify(ids) !== JSON.stringify(idsnoticias)){
    ponerHistorias()
  }
},300000);