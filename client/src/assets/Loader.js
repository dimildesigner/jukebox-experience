import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default class Loader {
  constructor() {
    this.loader = new GLTFLoader()
  }

  load(path) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => resolve(gltf),
        undefined,
        (error) => reject(error)
      )
    })
  }
}