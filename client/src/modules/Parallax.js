export default class Parallax {
  constructor(experience) {
    this.experience = experience
    this.camera = this.experience.camera.instance

    this.cursor = { x: 0, y: 0 }

    this.init()
  }

  init() {
    window.addEventListener('mousemove', (e) => {
      this.cursor.x = (e.clientX / window.innerWidth) - 0.5
      this.cursor.y = (e.clientY / window.innerHeight) - 0.5
    })
  }

  update() {
    const targetX = this.cursor.x * 1
    const targetY = -this.cursor.y * 1

    this.camera.position.x += (targetX - this.camera.position.x) * 0.05
    this.camera.position.y += (targetY - this.camera.position.y) * 0.05
  }
}
