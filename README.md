<div align="center">
  <img src="client/public/favicon-512.png" alt="Jukebox Experience Logo" width="120" />
  <h1>🎵 Jukebox Experience</h1>
  <p><strong>Uma experiência musical imersiva em 3D — busque, ouça e sinta a música.</strong></p>

  <p>
    <a href="https://jukebox-experience.vercel.app" target="_blank">
      <img alt="Live Demo" src="https://img.shields.io/badge/demo-ao%20vivo-71c837?style=for-the-badge&logo=vercel&logoColor=white" />
    </a>
    <img alt="Three.js" src="https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white" />
    <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
    <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  </p>
</div>

---

## ✨ Sobre o projeto

**Jukebox Experience** é uma aplicação web imersiva que combina uma cena 3D interativa com busca e reprodução de músicas em tempo real. O usuário pode girar o jukebox, explorar o cenário psicodélico e descobrir músicas pelo painel lateral — tudo em uma única experiência fluida.

---

## 🎬 Funcionalidades

| Recurso | Descrição |
|---|---|
| 🎸 **Cena 3D interativa** | Jukebox renderizado com Three.js, rotacionável via arrasto (mouse e touch) |
| 🔍 **Busca de músicas** | Busca por artista, álbum ou título via iTunes Search API |
| 🎵 **Preview de 30 segundos** | Reprodução do preview oficial de cada faixa encontrada |
| 💿 **Disco de vinil animado** | Gira enquanto a música toca, com notas musicais flutuando |
| 🎚️ **Reatividade ao áudio** | Luzes, partículas e cenário reagem à frequência da música |
| 📱 **Responsivo** | Funciona em desktop e mobile (touch e resize dinâmico) |
| 🎛️ **Mini player fixo** | Rodapé com capa do álbum, artista e indicador de reprodução |
| ✨ **Efeito de scratch** | Arrasto rápido no jukebox distorce o áudio como um DJ |

---

## 🏗️ Arquitetura

```
jukebox-experience/
├── client/                  # Frontend (Vite + Three.js)
│   ├── public/
│   │   ├── audio/           # Trilhas de fundo e efeitos
│   │   ├── models/          # Modelo 3D do jukebox (.glb)
│   │   └── textures/        # Texturas e partículas
│   └── src/
│       ├── core/
│       │   ├── Experience.js   # Orquestrador principal
│       │   ├── Camera.js       # Câmera perspectiva + resize
│       │   └── Renderer.js     # WebGL renderer + resize
│       ├── modules/
│       │   ├── AudioEngine.js  # Web Audio API + reprodução
│       │   ├── JukeboxUI.js    # Drawer, mini player, disco vinil
│       │   ├── Interaction.js  # Mouse + Touch + Raycaster
│       │   └── Particles.js    # Sistema de partículas
│       └── utils/
│           └── Sizes.js        # Dimensões e responsividade
│
└── server/                  # Backend (Express)
    └── server.js            # Proxy iTunes API + áudio CORS
```

---

## 🚀 Como rodar localmente

### Pré-requisitos
- Node.js 18+
- npm

### 1. Clone o repositório

```bash
git clone https://github.com/dimildesigner/jukebox-experience.git
cd jukebox-experience
```

### 2. Inicie o servidor (backend)

```bash
cd server
npm install
npm start
```

O servidor sobe em `http://localhost:3001`

### 3. Inicie o cliente (frontend)

```bash
cd ../client
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador.

---

## 🌐 Deploy

| Serviço | Papel |
|---|---|
| **Vercel** | Frontend (client/) — deploy automático a cada push na `main` |
| **Render** | Backend (server/) — servidor Express com proxy de áudio |

### Variáveis de ambiente (Render)

Nenhuma variável é necessária — a iTunes API é pública e não exige autenticação.

---

## 🎮 Como usar

1. **Acesse** [jukebox-experience.vercel.app](https://jukebox-experience.vercel.app)
2. **Gire o jukebox** arrastando com o mouse ou dedo
3. **Clique no hambúrguer** (canto superior esquerdo) para abrir o painel de busca
4. **Digite** artista, álbum ou música e clique em **Buscar**
5. **Clique em uma faixa** para ouvir o preview de 30 segundos
6. **Observe** o disco de vinil girar e as notas musicais flutuarem 🎶

---

## 🛠️ Tecnologias

**Frontend**
- [Three.js](https://threejs.org/) — renderização 3D
- [Vite](https://vitejs.dev/) — bundler e dev server
- Web Audio API — análise de frequência e efeitos de áudio
- CSS puro — animações do disco, notas e drawer

**Backend**
- [Express](https://expressjs.com/) — servidor HTTP
- [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/) — busca de músicas (gratuita, sem autenticação)
- Proxy de áudio — resolve restrições de CORS dos previews

---

## 📄 Licença

MIT © [dimildesigner](https://github.com/dimildesigner)
