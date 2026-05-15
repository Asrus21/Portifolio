# Portfólio — Thiago Souza

Site portfólio de página única, com tema claro/escuro, alternância PT/EN, scroll suave e botão voltar ao topo.

## Estrutura

```
portfolio/
├── index.html              # Conteúdo principal
├── css/
│   └── styles.css          # Todos os estilos
├── js/
│   ├── translations.js     # Textos em PT e EN
│   └── main.js             # Lógica (tema, idioma, scroll, etc.)
├── assets/
│   └── minha-foto.png      # Coloque sua foto aqui (PNG ou JPG)
└── README.md
```

## O que falta preencher

O site já está com seus dados (nome, email, telefone, LinkedIn, descrição do currículo, formação, idiomas). Só sobraram **2 placeholders** pra você completar:

### `[SEU LINK GITHUB]` aparece em 3 lugares no `index.html`:

1. **Projeto 1** (Song Request Queue / Desktop) — linha do `<a href="[SEU LINK GITHUB]">` do primeiro card
2. **Projeto 2** (Spotify API Command) — linha do `<a href="[SEU LINK GITHUB]">` do segundo card
3. **Seção Contato** — card do GitHub

Substitua cada um pelo link correto:
- Para o card de contato: `https://github.com/SEU-USUARIO`
- Para cada projeto: link direto do repositório (ex: `https://github.com/SEU-USUARIO/song-request-queue`)

### Foto

Salve sua foto como `assets/minha-foto.png` (recomendado: PNG ou JPG, proporção 4:5, ~800×1000px).

## Deploy no GitHub Pages

1. Crie um repositório no GitHub.
   - Pra ter URL curta tipo `seuusuario.github.io`, nomeie o repo exatamente assim: `seuusuario.github.io`.
   - Pra qualquer outro nome, a URL fica `seuusuario.github.io/nome-do-repo/`.
2. Suba todos os arquivos para o repositório (`index.html`, `css/`, `js/`, `assets/`).
3. No GitHub, vá em **Settings → Pages**.
4. Em "Source", selecione branch `main` e pasta `/ (root)`.
5. Salve. Em alguns minutos seu site estará no ar.

## Recursos

- **Tema claro/escuro** — botão no canto superior direito; salva a preferência no navegador.
- **PT / EN** — botão-lista ao lado do tema; salva a preferência.
- **Scroll suave** — efeito de lerp aplicado no desktop; respeita `prefers-reduced-motion` e usa scroll nativo no mobile.
- **Voltar ao topo** — botão flutuante aparece depois de rolar 500px.
- **Animações de entrada** — cards aparecem com fade ao entrar na viewport.
- **Responsivo** — funciona em celular, tablet e desktop.

## Tecnologias

HTML5, CSS3 (variáveis, Grid, Flexbox), JavaScript vanilla. Sem frameworks, sem build, sem dependências.
