# 🎌 Animex/Library

Uma biblioteca pessoal para cadastrar, avaliar e organizar animes, com visual dark em roxo e neon.
Feito com **HTML, CSS e JavaScript puro**, sem frameworks e sem back end: os dados ficam salvos no próprio navegador.


## ✨ Funcionalidades

- ➕ **Adicionar, editar e excluir** animes
- ⭐ **Avaliação por estrelas** (de 1 a 5), direto no card ou no formulário
- 📌 **Status**: Assistindo, Concluído, Quero ver e Abandonado
- 🔎 **Busca por título** e **filtros** por status e gênero
- ↕️ **Ordenação** por mais recentes, maior nota, título (A–Z) ou ano
- 📊 **Estatísticas**: total de animes, concluídos e nota média
- 🖼️ **Capa por URL ou upload de arquivo** (a imagem é redimensionada para 300 px de largura)
- 🎨 **Capa automática**: sem imagem, o card mostra um gradiente com o título do anime
- 💾 **Exportar e importar** a biblioteca em JSON, para backup
- 🌌 **Efeito parallax** no banner (lua e torii acompanham o mouse)

## 🛠️ Tecnologias

| Tecnologia | Uso |
| --- | --- |
| HTML5 | Estrutura da página e do formulário |
| CSS3 | Layout, tema dark e animações |
| JavaScript (ES6+) | Lógica, filtros, modal, importação/exportação e efeitos |
| localStorage | Salvar a biblioteca no navegador |
| Google Fonts (Poppins) | Tipografia |

## 📁 Estrutura do projeto

```
animex-library/
├── index.html      # Estrutura da página
├── style.css       # Estilos e tema visual
├── script.js       # Lógica da aplicação
├── capas/          # (opcional) imagens de capa usadas por caminho local
└── docs/           # (opcional) prints do projeto para este README
```

## 🚀 Como executar

Não precisa instalar nada.

1. Baixe ou clone o repositório:
   ```bash
   git clone https://github.com/SEU-USUARIO/animex-library.git
   ```
2. Abra a pasta no **VS Code**.
3. Clique com o botão direito em `index.html` e escolha **Open with Live Server**
   (ou simplesmente abra o `index.html` no navegador).

## 📖 Como usar

1. Clique em **+ Adicionar** e preencha título, ano, status, gêneros (separados por vírgula), nota, capa e anotações.
2. Na capa, cole uma **URL** de imagem, escreva um **caminho local** (ex.: `capas/meu-anime.png`) ou envie um **arquivo**.
3. Use a busca, os filtros e a ordenação para encontrar seus animes.
4. Clique nas estrelas do card para mudar a nota rapidamente.
5. Use **Editar** e **Excluir** em cada card para gerenciar a lista.

### 💾 Backup

- **Exportar** baixa o arquivo `biblioteca-animes.json` com toda a sua lista.
- **Importar** carrega um arquivo JSON e **substitui** a biblioteca atual. Exporte antes se não quiser perder o que já cadastrou.

Formato esperado do arquivo:

```json
[
  {
    "id": 1,
    "title": "Spirited Away",
    "year": 2001,
    "genres": ["Aventura", "Família"],
    "status": "done",
    "rate": 5,
    "img": "",
    "note": ""
  }
]
```

Valores aceitos em `status`: `watching`, `done`, `plan` e `drop`. A nota (`rate`) vai de 0 a 5.

> ⚠️ Os dados ficam salvos **neste navegador** (localStorage). Limpar os dados do site ou trocar de navegador apaga a lista. Use a exportação para manter um backup.

## 🧠 O que aprendi

- Organizar o JavaScript em funções pequenas, com um objeto de estado central
- Salvar e recuperar dados com `localStorage`
- Ler e gerar arquivos JSON no navegador (`FileReader` e `Blob`)
- Redimensionar imagens com `canvas` antes de salvar
- Proteger o HTML contra texto malicioso (`escapeHtml`)
- Depurar: um `id` duplicado no HTML pode derrubar o script inteiro, e um evento sem `addEventListener` deixa botões sem resposta

## 🤖 Uso de IA

Usei ajuda de IA em algumas partes importantes do `script.js`, principalmente na **leitura de arquivos JSON (importação e exportação)** e nos **efeitos visuais**, além de apoio na depuração de erros. Estudei, ajustei e testei cada trecho. As capas e personagens de exemplo (animes fictícios) também foram criados com apoio de IA, para não depender de imagens com direitos autorais.

## 🔮 Ideias para o futuro

- [ ] Buscar capas automaticamente por uma API (AniList ou Kitsu)
- [ ] Campo de episódios assistidos e progresso
- [ ] Tema claro/escuro alternável
- [ ] Layout responsivo com menu lateral
- [ ] Publicar o site (GitHub Pages)


Feito por **Bianca** · front end // criatividade // foco 💜
