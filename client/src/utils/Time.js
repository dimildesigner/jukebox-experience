export default class Time {
  constructor() {
    this.start = Date.now()
    this.elapsed = 0

    this.update()
  }

  update() {
    this.elapsed = Date.now() - this.start

    requestAnimationFrame(() => this.update())
  }
}
