import * as THREE from 'three'
import gsap from 'gsap';
import { MSDFTextGeometry, MSDFTextMaterial, uniforms } from "three-msdf-text";

import Experience from './Experience'

import vertex from './shaders/canvas/vertex.glsl'
import fragment from './shaders/canvas/fragment.glsl'

export default class Canvas {
  constructor(_options) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.config = this.experience.config
    this.resources = this.experience.resources
    this.debug = this.experience.debug
    this.time = this.experience.time;

    if (this.debug) {
      this.debugFolder = this.debug.addFolder({
        title: "Text Animation",
      })
    }

    this.setMaterial()
    this.setMesh()
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      defines: {
        IS_SMALL: false,
      },
      extensions: {
        derivatives: true,
      },
      uniforms: {
        // Common
        ...uniforms.common,
        // Rendering
        ...uniforms.rendering,
        // Strokes
        ...uniforms.strokes,
        ...{
          uStrokeColor: { value: new THREE.Color(0x00ff00)},
          uProgress1: { value: 0.0 },
          uProgress2: { value: 0.0 },
          uProgress3: { value: 0.0 },
          uProgress4: { value: 0.0 },
          uTime: { value: 0.0 }
        }
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    if (this.debug) {
      this.debugFolder.addInput(
        this.material.uniforms.uProgress1,
        'value',
        { min: 0, max: 1, step: 0.001, label: 'progress 1' }
      )
      this.debugFolder.addInput(
        this.material.uniforms.uProgress2,
        'value',
        { min: 0, max: 1, step: 0.001, label: 'progress 2' }
      )
      this.debugFolder.addInput(
        this.material.uniforms.uProgress3,
        'value',
        { min: 0, max: 1, step: 0.001, label: 'progress 3' }
      )
      this.debugFolder.addInput(
        this.material.uniforms.uProgress4,
        'value',
        { min: 0, max: 1, step: 0.001, label: 'progress 4' }
      )
      this.debugFolder.addButton({
        title: "play",
        label: 'animation'
      }).on('click', () => {
        let d = 4;
        let stagger = 0.05;

        let tl = gsap.timeline()
        tl.to(this.material.uniforms.uProgress1, {
          value: 1,
          duration: d,
          ease: 'power2.out'
        })
        tl.to(this.material.uniforms.uProgress2, {
          value: 1,
          duration: d,
          ease: 'power2.out'
        }, stagger * 2)
        tl.to(this.material.uniforms.uProgress3, {
          value: 1,
          duration: d,
          ease: 'power2.out'
        }, stagger * 4)
        tl.to(this.material.uniforms.uProgress4, {
          value: 1,
          duration: d,
          ease: 'power2.out'
        }, stagger * 6)
      })
    }
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    // this.scene.add(this.mesh)

    Promise.all([
      loadFontAtlas('/font/DIN-Bold.png'),
      loadFont('/font/DIN-Bold-msdf.fmt'),
    ]).then(([atlas, font]) => {
      this.geometry = new MSDFTextGeometry({
        text: "WELCOME",
        font: font.data
      });

 
      this.material.uniforms.uMap.value = atlas;

      const mesh = new THREE.Mesh(this.geometry, this.material);
      mesh.scale.set(0.01, -0.01, 0.01)
      mesh.position.x = -1
      this.scene.add(mesh)
    });

    function loadFontAtlas(path) {
      const promise = new Promise((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.load(path, resolve);
      });

      return promise;
    }

    function loadFont(path) {
      const promise = new Promise((resolve, reject) => {
        const loader = new THREE.FontLoader();
        loader.load(path, resolve);
      });

      return promise;
    }
  }

  update() {
    if(this.material)
      this.material.uniforms.uTime.value = this.time.elapsed * 0.005;
  }
}