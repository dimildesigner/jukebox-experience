import * as THREE from "three";

export default class Interaction {
  constructor(experience) {
    this.experience = experience;
    this.scene = experience.scene;
    this.camera = experience.camera;
    this.jukebox = experience.jukebox;

    // 🔹 RAYCAST
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // 🔹 CONTROLE DE ROTAÇÃO
    this.isDragging = false;
    this.previousMouseX = 0;
    this.rotationSpeed = 0;

    // Scratch
    this.lastRotationSpeed = 0;
    this.lastScratchTime = 0;

    this.initEvents();
  }

  initEvents() {
    const dom = document; // mais confiável que window

    dom.addEventListener("mousemove", (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      if (this.isDragging && this.jukebox?.model) {
        const delta = event.clientX - this.previousMouseX;

        // 🔥 aqui estava OK, só mantive
        this.rotationSpeed = delta * 0.01;

        this.previousMouseX = event.clientX;
      }
    });

    dom.addEventListener("mousedown", (event) => {
      // 🎯 SÓ inicia drag se clicar na jukebox
      this.raycaster.setFromCamera(this.mouse, this.camera.instance);

      const intersects = this.raycaster.intersectObject(
        this.jukebox.model,
        true,
      );

      if (intersects.length > 0) {
        this.isDragging = true;
        this.previousMouseX = event.clientX;

        document.body.style.cursor = "grabbing";
      }
    });

    dom.addEventListener("mouseup", () => {
      this.isDragging = false;
      document.body.style.cursor = "grab";
    });

    dom.addEventListener("click", (event) => {
      this.onClick(event);
    });
  }

  // 🎯 DETECÇÃO (hover)
  checkIntersections() {
    if (!this.jukebox?.model) return;

    this.raycaster.setFromCamera(this.mouse, this.camera.instance);

    const intersects = this.raycaster.intersectObject(this.jukebox.model, true);

    if (intersects.length > 0) {
      document.body.style.cursor = this.isDragging ? "grabbing" : "pointer";
    } else {
      document.body.style.cursor = this.isDragging ? "grabbing" : "grab";
    }
  }

  // 🖱️ CLIQUE
  // onClick(event) {
  //   if (!this.jukebox?.model) return;

  //   this.raycaster.setFromCamera(this.mouse, this.camera.instance);

  //   const intersects = this.raycaster.intersectObject(this.jukebox.model, true);

  //   if (intersects.length > 0) {
  //     const object = intersects[0].object;

  //     console.log("🎯 clicou:", object.name);

  //     this.handleClick(object);
  //   }
  // }

  onClick(event) {
    this.raycaster.setFromCamera(this.mouse, this.camera.instance);

    const objectsToTest = [];

    if (this.jukebox?.model) {
      objectsToTest.push(this.jukebox.model);
    }

    if (this.experience.vinylFrames?.group) {
      objectsToTest.push(this.experience.vinylFrames.group);
    }

    const intersects = this.raycaster.intersectObjects(objectsToTest, true);

    if (intersects.length > 0) {
      const object = intersects[0].object;

      console.log("🎯 clicou:", object.name);

      this.handleClick(object);
    }
  }

  // 🎮 AÇÕES
  handleClick(object) {
    if (!object.name) return;

    if (object.name === "playButton") {
      console.log("▶️ PLAY/PAUSE");
      this.experience.audio.toggle();
    }

    if (object.name === "nextButton") {
      console.log("⏭️ NEXT");
      this.experience.audio.nextTrack();
    }

    if (object.name === "vinylPlay") {
      console.log("🟢 PLAY");
      this.experience.audio.play();
    }

    if (object.name === "vinylPause") {
      console.log("🔴 PAUSE");
      this.experience.audio.pause();
    }
  }

  // 🔁 LOOP
  update() {
    this.checkIntersections();

    // 🎰 rotação com inércia
    if (this.jukebox?.model) {
      // this.jukebox.model.rotation.y += this.rotationSpeed * 1.1;
      this.jukebox.model.rotation.y += this.rotationSpeed * 1.0;

      // 🎧 efeito vinil baseado na rotação
      const speed = Math.abs(this.rotationSpeed);

      // mapeia velocidade → áudio
      const playback = 1 + speed * 5;

      // aplica no áudio
      this.experience.audio.setPlaybackRate(playback);

      // evita áudio “travado rápido” quando parar
      if (this.rotationSpeed === 0) {
        this.currentPlayback = this.currentPlayback || 1;

        this.currentPlayback += (playback - this.currentPlayback) * 0.1;

        this.experience.audio.setPlaybackRate(this.currentPlayback);
      }

      // 🎧 Scratch detectar mudança de direção
      const now = Date.now();

      if (
        Math.sign(this.rotationSpeed) !== Math.sign(this.lastRotationSpeed) &&
        Math.abs(this.rotationSpeed) > 0.01 &&
        now - this.lastScratchTime > 200 // debounce
      ) {
        console.log("🎧 scratch!");

        this.experience.audio.playScratch();

        // leve "freio" na música principal
        this.experience.audio.setPlaybackRate(0.8);

        this.lastScratchTime = now;
      }

      this.lastRotationSpeed = this.rotationSpeed;

      // console.log("Interaction update rodando");

      // 🧠 desaceleração suave
      this.rotationSpeed *= 0.75;

      // 🛑 corte mínimo pra evitar loop infinito
      if (Math.abs(this.rotationSpeed) < 0.0001) {
        this.rotationSpeed = 0;
      }
    }
  }
}
