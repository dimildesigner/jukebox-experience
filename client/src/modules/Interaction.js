import * as THREE from "three";

export default class Interaction {
  constructor(experience) {
    this.experience = experience;
    this.scene      = experience.scene;
    this.camera     = experience.camera;
    this.jukebox    = experience.jukebox;

    this.raycaster = new THREE.Raycaster();
    this.mouse     = new THREE.Vector2();

    this.isDragging    = false;
    this.previousX     = 0;
    this.rotationSpeed = 0;

    this.lastRotationSpeed = 0;
    this.lastScratchTime   = 0;

    this.initEvents();
  }

  // Converte coordenadas de toque/mouse para NDC (-1..1)
  toNDC(clientX, clientY) {
    return {
      x: (clientX / window.innerWidth)  *  2 - 1,
      y: (clientY / window.innerHeight) * -2 + 1,
    };
  }

  initEvents() {
    const dom = document;

    // ── MOUSE ──────────────────────────────────────────
    dom.addEventListener("mousemove", (e) => {
      const { x, y } = this.toNDC(e.clientX, e.clientY);
      this.mouse.set(x, y);

      if (this.isDragging && this.jukebox?.model) {
        this.rotationSpeed = (e.clientX - this.previousX) * 0.01;
        this.previousX = e.clientX;
      }
    });

    dom.addEventListener("mousedown", (e) => {
      if (this.hitJukebox()) {
        this.isDragging = true;
        this.previousX  = e.clientX;
        document.body.style.cursor = "grabbing";
      }
    });

    dom.addEventListener("mouseup", () => {
      this.isDragging = false;
      document.body.style.cursor = "grab";
    });

    dom.addEventListener("click", (e) => this.onClick(e));

    // ── TOUCH ──────────────────────────────────────────
    dom.addEventListener("touchstart", (e) => {
      const t = e.touches[0];
      const { x, y } = this.toNDC(t.clientX, t.clientY);
      this.mouse.set(x, y);

      if (this.hitJukebox()) {
        this.isDragging = true;
        this.previousX  = t.clientX;
      }
    }, { passive: true });

    dom.addEventListener("touchmove", (e) => {
      const t = e.touches[0];
      const { x, y } = this.toNDC(t.clientX, t.clientY);
      this.mouse.set(x, y);

      if (this.isDragging && this.jukebox?.model) {
        this.rotationSpeed = (t.clientX - this.previousX) * 0.01;
        this.previousX = t.clientX;
      }
    }, { passive: true });

    dom.addEventListener("touchend", (e) => {
      // Toque rápido sem arrasto = clique
      if (this.isDragging && Math.abs(this.rotationSpeed) < 0.005) {
        const t = e.changedTouches[0];
        const { x, y } = this.toNDC(t.clientX, t.clientY);
        this.mouse.set(x, y);
        this.onClick(e);
      }
      this.isDragging = false;
    });
  }

  hitJukebox() {
    if (!this.jukebox?.model) return false;
    this.raycaster.setFromCamera(this.mouse, this.camera.instance);
    return this.raycaster.intersectObject(this.jukebox.model, true).length > 0;
  }

  checkIntersections() {
    if (!this.jukebox?.model) return;
    this.raycaster.setFromCamera(this.mouse, this.camera.instance);
    const hit = this.raycaster.intersectObject(this.jukebox.model, true).length > 0;
    document.body.style.cursor = this.isDragging ? "grabbing" : hit ? "pointer" : "grab";
  }

  onClick(event) {
    this.raycaster.setFromCamera(this.mouse, this.camera.instance);

    const targets = [];
    if (this.jukebox?.model)                    targets.push(this.jukebox.model);
    if (this.experience.vinylFrames?.group)     targets.push(this.experience.vinylFrames.group);

    const hits = this.raycaster.intersectObjects(targets, true);
    if (hits.length > 0) {
      console.log("🎯 clicou:", hits[0].object.name);
      this.handleClick(hits[0].object);
    }
  }

  handleClick(object) {
    if (!object.name) return;
    if (object.name === "playButton")  this.experience.audio.toggle();
    if (object.name === "nextButton")  this.experience.audio.nextTrack();
    if (object.name === "vinylPlay")   this.experience.audio.play();
    if (object.name === "vinylPause")  this.experience.audio.pause();
  }

  update() {
    this.checkIntersections();

    if (this.jukebox?.model) {
      this.jukebox.model.rotation.y += this.rotationSpeed;

      const speed = Math.abs(this.rotationSpeed);
      this.experience.audio.setPlaybackRate(1 + speed * 5);

      // Scratch ao mudar direção
      const now = Date.now();
      if (
        Math.sign(this.rotationSpeed) !== Math.sign(this.lastRotationSpeed) &&
        speed > 0.01 &&
        now - this.lastScratchTime > 200
      ) {
        this.experience.audio.playScratch();
        this.experience.audio.setPlaybackRate(0.8);
        this.lastScratchTime = now;
      }

      this.lastRotationSpeed = this.rotationSpeed;

      // Inércia
      this.rotationSpeed *= 0.75;
      if (Math.abs(this.rotationSpeed) < 0.0001) this.rotationSpeed = 0;
    }
  }
}
