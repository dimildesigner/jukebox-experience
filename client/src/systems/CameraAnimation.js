// Camera parada do chão para cima

// export default class CameraAnimation {
//   constructor(experience) {
//     this.experience = experience;
//     this.camera = experience.camera.instance;
//   }

//   update() {
//     const time = Date.now() * 0.0005;

//     // movimento leve cinematográfico
//     this.camera.position.x = Math.sin(time) * 2;
//     this.camera.position.z = Math.cos(time) * 2 + 5;
//   }
// }



import gsap from "gsap";

export default class CameraAnimation {
  constructor(experience) {
    this.experience = experience;
    this.camera = this.experience.camera.instance;

    this.start();
  }

  start() {
    // posição inicial (longe)
    this.camera.position.set(0, 2, 10);

    // anima aproximação
    gsap.to(this.camera.position, {
      duration: 4,
      z: 4,
      y: 1,
      ease: "power2.out",
    });

    // leve movimento lateral
    gsap.to(this.camera.position, {
      duration: 6,
      x: 1,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    gsap.to({}, {
        duration: 4,
        onComplete: () => {
          this.experience.interaction.enabled = true;
        },
      },
    );
  }
}
