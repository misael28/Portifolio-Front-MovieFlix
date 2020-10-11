const CUPOM_METADE_DESCONTO = "HTMLNAOEHLINGUAGEM";

fetch(
  "https://tmdb-proxy-workers.vhfmag.workers.dev/3/discover/movie?language=pt-BR"
).then((resp) =>
  resp.json().then((respostaJson) => {
    const filmes = respostaJson.results;

    const listagemGeralFilmes = document.querySelector(
      ".listagemGeral .filmes"
    );

    const listagemTopFilmes = document.querySelector(".listagemTop .filmes");

    popularListagemFilmes(filmes.slice(0, 5), listagemTopFilmes);

    popularListagemFilmes(filmes, listagemGeralFilmes);
  })
);

const todos = document
  .querySelector(".listagemGeral .filtros .selecionado")
  .addEventListener("click", () =>
    fetch(
      "https://tmdb-proxy-workers.vhfmag.workers.dev/3/discover/movie?language=pt-BR"
    )
      .then((resposta) => {
        return resposta.json();
      })
      .then((respostaJson) => {
        const filmes = respostaJson.results;

        const listagemGeralFilmes = document.querySelector(
          ".listagemGeral .filmes"
        );

        listagemGeralFilmes.innerHTML = "";
        popularListagemFilmes(filmes, listagemGeralFilmes);
      })
  );

function popularListagemFilmes(filmes, elemento) {
  for (const filme of filmes) {
    const li = document.createElement("li");
    li.innerHTML = ` 
		  <img src="${filme.poster_path}" />
		  <div class="overlay">
			  <img src="imagens/Star 2.png" />
			  <div class="metadados">
			  <h3>${filme.title}</h3>
			  <div class="avaliacao">
				  <img src="imagens/Star 1.png" />
				  ${filme.vote_average}
			  </div>
			  </div>
			  <button>
			  <span>Sacola</span>
			  <span class="preco">R$<span class="valor">${filme.price}</span></span>
			  </button>
		  </div>
		  `;

    elemento.append(li);

    const elementoBotao = li.querySelector("button");
    elementoBotao.addEventListener("click", () => {
      const valorIndicado = localStorage.getItem("sacola");
      let sacola = [];
      if (valorIndicado) {
        sacola = JSON.parse(valorIndicado);
      }

      const filmeNaSacola = sacola.filter(
        (itemDeSacola) => itemDeSacola.filme.id === filme.id
      )[0];
      if (filmeNaSacola) {
        filmeNaSacola.qtd++;
      } else {
        sacola.push({ qtd: 1, filme: filme });
      }

      localStorage.setItem("sacola", JSON.stringify(sacola));
      popularSacola();
    });
  }
}

function popularSacola() {
  const valorIndicado = localStorage.getItem("sacola");
  const cupom = localStorage.getItem("cupom");

  let sacola = [];
  if (valorIndicado) {
    sacola = JSON.parse(valorIndicado);
  }
  const elementoItensSacola = document.querySelector(".itens-sacola");
  const elementoSacolaVazia = document.querySelector(".sacola-vazia");
  const elementoBotaoComprar = document.querySelector(".sacola .comprar");
  if (sacola.length === 0) {
    // sacola vazia
    elementoItensSacola.setAttribute("hidden", "");
    elementoBotaoComprar.setAttribute("hidden", "");
    elementoSacolaVazia.removeAttribute("hidden");
  } else {
    elementoItensSacola.removeAttribute("hidden");
    elementoBotaoComprar.removeAttribute("hidden");
    elementoSacolaVazia.setAttribute("hidden", "");

    elementoItensSacola.innerHTML = "";
    for (const item of sacola) {
      const li = document.createElement("li");
      li.innerHTML = `
                <img src="${item.filme.poster_path}">
                <div class="metadados">
                    <div class="titulo">${item.filme.title}</div>
                    <div class="preco">
                        R$ ${item.filme.price}
                    </div>
                </div>
                <div class="acoes">
                    <button class="adicionar">
                        <img src="imagens/adicionar.png" alt="Adicionar mais um filme à sacola">
                    </button>
                    <span>${item.qtd}</span>
                    <button class="remover">
                        ${
                          item.qtd === 1
                            ? `<img src="imagens/deletar.png" alt="Remover filme da sacola">`
                            : `<img src="imagens/diminuir.png" alt="Remover um filme da sacola">`
                        }
                    </button>
                </div>
            `;

      elementoItensSacola.append(li);

      const botaoAdicionar = li.querySelector(".adicionar");
      const botaoRemover = li.querySelector(".remover");

      botaoAdicionar.addEventListener("click", () => {
        item.qtd++;
        localStorage.setItem("sacola", JSON.stringify(sacola));
        popularSacola();
      });

      botaoRemover.addEventListener("click", () => {
        if (item.qtd > 1) {
          item.qtd--;
        } else {
          sacola = sacola.filter(
            (itemDeSacola) => itemDeSacola.filme.id !== item.filme.id
          );
        }

        localStorage.setItem("sacola", JSON.stringify(sacola));
        popularSacola();
      });
    }

    const elementoPrecoTotal = document.querySelector(".comprar .preco");
    const precoTotal = sacola.reduce((soma, itemDeSacola) => {
      return soma + itemDeSacola.qtd * itemDeSacola.filme.price;
    }, 0);

    elementoPrecoTotal.innerText =
      cupom === CUPOM_METADE_DESCONTO ? precoTotal / 2 : precoTotal;
  }
}

popularSacola();

const inputCupom = document.querySelector(".input-cupom input");
inputCupom.addEventListener("input", () => {
  localStorage.setItem("cupom", inputCupom.value);
  popularSacola();
});
inputCupom.value = localStorage.getItem("cupom");

fetch(
  "https://tmdb-proxy-workers.vhfmag.workers.dev/3/genre/movie/list?language=pt-BR"
)
  .then((res) => res.json())
  .then((respostaJson) => {
    const generos = respostaJson.genres;

    const elementoFiltros = document.querySelector(".filtros");
    for (const genero of generos.slice(0, 4)) {
      const button = document.createElement("button");
      button.innerText = genero.name;

      elementoFiltros.append(button);

      button.addEventListener("click", () => {
        fetch(
          `https://tmdb-proxy-workers.vhfmag.workers.dev/3/discover/movie?with_genres=${genero.id}&language=pt-BR`
        )
          .then((res) => res.json())
          .then((respostaJson) => {
            const filmes = respostaJson.results;

            const listagemGeralFilmes = document.querySelector(
              ".listagemGeral .filmes"
            );
            listagemGeralFilmes.innerHTML = "";
            popularListagemFilmes(filmes, listagemGeralFilmes);
            console.log(filmes);
          });

        const botoes = document.querySelectorAll(".filtros button");
        for (const botao of botoes) {
          botao.classList.remove("selecionado");
        }
        button.classList.add("selecionado");
      });
    }
  });
