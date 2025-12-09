const botones = document.querySelectorAll(".botones")
const stories = document.querySelector("#stories");
const anterior = document.querySelector("#anterior")
const siguiente = document.querySelector("#siguiente")
const numeropagina = document.querySelector("#pagina")
const estadodelosbotones = document.querySelector("#anteriorsiguiente")
let storyIds
let currentPage = 0;
let commentsPerPage = 3;
let pageNumber = 1;
let storyType = loadLocalSelect();
let isNotReloading = true;


numeropagina.textContent = pageNumber;

function showLoader() {
  estadodelosbotones.style.display = "none"
  stories.textContent="";
  let loaderDiv = document.createElement("div")
  loaderDiv.classList.add("loader-container")
  let loader = document.createElement("div")
  loader.classList.add("loader")
  loaderDiv.appendChild(loader)
  stories.appendChild(loaderDiv)
}

function hideLoader() {
  estadodelosbotones.style.display = ""
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
    storyType = pickType(element.textContent);
    localStorage.setItem("selecttype", storyType)
    history.pushState({},"",storyType)
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
  pageNumber++;
  numeropagina.textContent = pageNumber;
  currentPage += 10
  ponerHistorias()
})

anterior.addEventListener(("click"), () => {
  if (pageNumber == 1){
    return
  }
  currentPage = currentPage - 10;
  pageNumber--;
  numeropagina.textContent = pageNumber
  ponerHistorias()
})


async function pillarHistorias() {
  const response = await fetch(`https://hacker-news.firebaseio.com/v0/${storyType}.json`)
  return await response.json()
}



async function ponerHistorias() {
  isNotReloading = false;
  showLoader()

  storyIds = await pillarHistorias()

  const storiesSlice = storyIds.slice(currentPage, currentPage + 10)

  const noticias = await Promise.all(
    storiesSlice.map(id =>
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



    const commentsLink = document.createElement("a")
    commentsLink.textContent = "Numero Comentarios: " + (noticia.kids?.length || 0)
    commentsLink.addEventListener("click", () => {
      ponerComentarios(noticia.title, noticia.kids)
    })

    const time = document.createElement("p");

    time.textContent = "Time " + formaterTime(noticia.time)


    hideLoader()
        estadodelosbotones.style.display = ""

    const divdecontenido = document.createElement("div")
    divdecontenido.classList.add("contenido")

    
    divdecontenido.appendChild(score)
    divdecontenido.appendChild(autor)
    divdecontenido.appendChild(commentsLink)
    divdecontenido.appendChild(time)


    div.appendChild(a)
    div.appendChild(divdecontenido)


    stories.appendChild(div)
  })

}

async function ponerComentarios(noticia, kids) {
  isNotReloading = true;
  if (kids === undefined || kids === 0) {
    return
  }

  let commentIds = [];
  for (let index = 0; index < commentsPerPage; index++) {
    const element = kids[index];
    commentIds.push(element)
  }

  showLoader()

  const texto = document.createElement("div")
  texto.classList.add("story")
  texto.textContent = convertidor(noticia)

  stories.appendChild(texto)

  const comentarios = await Promise.all(
    commentIds.map(id => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(response => response.json())
    ))

  comentarios.forEach((comentario, i) => {
    const div = document.createElement("div")
    div.classList.add("story")
    div.textContent = comentario.by
    const p = document.createElement("p")
    p.innerHTML = convertidor( comentario.text)
    const a = document.createElement("a")
    a.textContent = "Numero Comentarios: " + (comentario.kids?.length || 0)
    a.addEventListener(("click"), () => {
      ponerComentarios(comentario.text, comentario.kids)
    })

    hideLoader()

    div.appendChild(p)
    div.appendChild(a)
    stories.appendChild(div)
  })

  let buttonContainer = document.createElement("div")
  buttonContainer.id="more"
  let moreButton = document.createElement("button")
  moreButton.textContent = "More"
  moreButton.classList.add("botones")

  moreButton.addEventListener("click", () => {
    commentsPerPage = commentsPerPage + 3
    ponerComentarios(noticia, kids)
  })

    estadodelosbotones.style.display = "none"

  buttonContainer.appendChild(moreButton)
  stories.appendChild(buttonContainer)
}


function ponerDatosDelAutor(autor) {
  isNotReloading = true;
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
      estadodelosbotones.style.display = "none"


  console.log(autor.about)

  div.appendChild(fecha)
  div.appendChild(karma)
  div.appendChild(about)

  stories.appendChild(div)
}


function convertidor(frase){
  console.log(frase)
  const htmlDecoder = document.createElement("textarea");
  htmlDecoder.innerHTML = frase
  let cleanText = htmlDecoder.value
  console.log(cleanText)
  cleanText = cleanText.replace(/<p>/gi, "\n") 
  console.log(cleanText)

  return cleanText
}


function loadLocalSelect() {
  let savedType = localStorage.getItem("selecttype")

  return savedType
}


function formatedDate(fecha) {
   let date = new Date(fecha * 1000)
   let month = String(date.getUTCMonth()+1).padStart(2,'0');
   let day = String(date.getUTCDate()).padStart(2,'0');
   let year = String(date.getUTCFullYear());
   day = Number(day)
   month = Number(month)
   let monthName = pickMonth(month)
   console.log(monthName  + " " + day + " " +year)
   return `${monthName} ${day} ${year}`
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
  if (!isNotReloading){
  let ids = await pillarHistorias()
  if (JSON.stringify(ids) !== JSON.stringify(storyIds)){
    ponerHistorias()
  }
}
},300000);