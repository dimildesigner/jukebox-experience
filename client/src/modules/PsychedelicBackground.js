import * as THREE from "three";

export default class PsychedelicBackground {
  constructor(scene, experience) {
    this.scene = scene;
    this.experience = experience;

    this.time = 0;

    this.createMesh();
  }

  createMesh() {
    this.geometry = new THREE.PlaneGeometry(80, 80, 22, 22);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uAudio: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
        `,
      fragmentShader: `
        uniform float uTime;
        uniform float uAudio;
        varying vec2 vUv;

        void main() {
        vec2 uv = vUv;

        float wave = sin(uv.x * 10.0 + uTime + uAudio * 5.0) * 0.5 +
                    sin(uv.y * 10.0 + uTime + uAudio * 5.0) * 0.5;

        vec3 color = vec3(
            sin(uTime + uv.x * 5.0) * 0.5 + 0.5,
            sin(uTime + uv.y * 5.0) * 0.5 + 0.5,
            sin(uTime) * 0.5 + 0.5
        );

        gl_FragColor = vec4(color * (wave + 1.0), 1.0);
        }
        `,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.position.z = -3;

    this.scene.add(this.mesh);
  }

  update() {
    this.time += 0.02;
    this.material.uniforms.uTime.value = this.time;

    const audio = this.experience.audio?.getFrequency?.() || 0;
    console.log(audio);

    this.material.uniforms.uAudio.value = 1;
  }
}
