const botones = document.querySelectorAll(".botones")
const stories = document.querySelector("#stories");
const cosarara = document.querySelector("#prueba")
const anterior = document.querySelector("#anterior")
const siguiente = document.querySelector("#siguiente")
const numeropagina = document.querySelector("#pagina")
//const radiobotones = document.querySelector("#radiobotones")
let contador = 0;
let contador2 = 3;
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
  ponerHistorias()
})

anterior.addEventListener(("click"),() => {
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
  stories.textContent = ""
  
  const ids = await pillarHistorias()
  
  const numerodenoticias = ids.slice(contador,contador+10)

  const noticias = await Promise.all(
      numerodenoticias.map(id => 
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(response => response.json())
      )
  )

  const autores = await Promise.all(
      noticias.map(noticia => {if (noticia.by){
        return fetch(`https://hacker-news.firebaseio.com/v0/user/${noticia.by}.json`).then(response => response.json())
      } else {
        return null;
      }
    })

  )

  noticias.forEach((noticia,i) => {
    const autorInfo = autores[i]

    console.log(noticia)

    const div = document.createElement("div")
    div.classList.add("story")



    const score = document.createElement("p");
    score.textContent = `Score: ${noticia.score}`;

    const autor = document.createElement("a")
    autor.textContent = `Autor: ${autorInfo.id}`
   
    const a = document.createElement("a");
    a.textContent = noticia.title;
    a.href = noticia.url;


    const skibidi = document.createElement("p")
    skibidi.textContent = "Numero Comentarios: " + (noticia.kids?.length || 0)
    skibidi.addEventListener("click",() => {
      ponerComentarios(noticia.kids)
    })

    const time = document.createElement("p");

    time.textContent = "Time " + formaterTime(noticia.time)

    console.log(skibidi)

    div.appendChild(a)
    div.appendChild(score)
    div.appendChild(autor)
    div.appendChild(skibidi)  
    div.appendChild(time)
  

    stories.appendChild(div)
  })

}

function formaterTime(time){
  let date = new Date(time * 1000)
  let hours = date.getHours()
  let minutes =  date.getMinutes();
  let formatedTime = hours + ":" + minutes
  return formatedTime
}

async function ponerComentarios(kids) {
  let comentariosIds = [];
  for (let index = 0; index < contador2; index++) {
    const element = kids[index];
    comentariosIds.push(element)
  }

  stories.textContent=""

  const comentarios = await Promise.all(
    comentariosIds.map(id => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(response => response.json())
  ))

  comentarios.forEach((comentario,i) => {
    const div = document.createElement("div")
    div.classList.add("story")
    const p = document.createElement("p")
    p.textContent = comentario.text

    div.textContent = comentario.by

    div.appendChild(p)

    stories.appendChild(div)
  })

  let button = document.createElement("button")
  button.textContent = "More"

  button.addEventListener("click", () => {
    contador2 = contador2 + 3
    ponerComentarios(kids)
  })

  stories.appendChild(button)
}
  