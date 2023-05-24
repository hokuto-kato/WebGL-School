// = 004 ======================================================================
// three.js には Object3D というクラスが存在します。
// three.js を理解する上で、この Object3D は非常に重要なオブジェクトです。
// https://threejs.org/docs/#api/en/core/Object3D
//
// このオブジェクトを継承しているあらゆるオブジェクトは、position や rotation と
// いったプロパティを持っており、位置を動かしたり回転したり、といった基本的な 3D
// での操作を行うことができます。（それ以外にも様々な機能を持ちます）
// ここでは、スペースキーが押されている間だけ rotation を変化させるような処理を
// 行い、オブジェクトを回転させてみましょう。
// ============================================================================

// 必要なモジュールを読み込み
import * as THREE from '../../lib/three.module.js'
import { OrbitControls } from '../../lib/OrbitControls.js' //

// DOM がパースされたことを検出するイベントを設定
window.addEventListener('DOMContentLoaded', () => {
  // 制御クラスのインスタンスを生成
  const app = new App3()
  // 初期化
  app.init()
  // 描画
  app.render()
}, false)

/**
 * three.js を効率よく扱うために自家製の制御クラスを定義
 */
class App3 {
  /**
   * カメラ定義のための定数
   */
  static get CAMERA_PARAM () {
    return {
      fovy: 60,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 10.0,
      x: 0.0,
      y: 2.0,
      z: 5.0,
      lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    }
  }

  /**
   * レンダラー定義のための定数
   */
  static get RENDERER_PARAM () {
    return {
      clearColor: 0x0b0114,
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  /**
   * マテリアル定義のための定数
   */
  static get MATERIAL_PARAM () {
    return {
      color: 0xd74172, // マテリアルの基本色
    }
  }

  /**
   * コンストラクタ
   * @constructor
   */
  constructor () {
    this.renderer // レンダラ
    this.scene    // シーン
    this.camera   // カメラ
    this.geometry // ジオメトリ
    this.material // マテリアル
    this.box      // ボックスメッシュ
    this.controls // オービットコントロール
    this.axesHelper // 軸ヘルパー

    this.isDown = false // キーの押下状態を保持するフラグ @@@

    // render メソッドはブラウザ制御で再帰的に呼び出されるので this を固定する
    this.render = this.render.bind(this)

    // キーの押下や離す操作を検出できるようにする @@@
    window.addEventListener('keydown', (keyEvent) => {
      // スペースキーが押されている場合はフラグを立てる
      switch (keyEvent.key) {
        case ' ':
          this.isDown = true
          break
        default:
      }
    }, false)
    window.addEventListener('keyup', () => {
      // なんらかのキーが離された操作で無条件にフラグを下ろす
      this.isDown = false
    }, false)
  }

  /**
   * 初期化処理
   */
  init () {
    // レンダラー
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setClearColor(new THREE.Color(App3.RENDERER_PARAM.clearColor))
    this.renderer.setSize(App3.RENDERER_PARAM.width, App3.RENDERER_PARAM.height)
    const wrapper = document.querySelector('#webgl')
    wrapper.appendChild(this.renderer.domElement)

    // シーン
    this.scene = new THREE.Scene()

    // カメラ
    this.camera = new THREE.PerspectiveCamera(
      App3.CAMERA_PARAM.fovy,
      App3.CAMERA_PARAM.aspect,
      App3.CAMERA_PARAM.near,
      App3.CAMERA_PARAM.far,
    )
    this.camera.position.set(
      App3.CAMERA_PARAM.x,
      App3.CAMERA_PARAM.y,
      App3.CAMERA_PARAM.z,
    )
    this.camera.lookAt(App3.CAMERA_PARAM.lookAt)

    // ジオメトリとマテリアル
    this.geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0)
    this.material = new THREE.MeshBasicMaterial(App3.MATERIAL_PARAM)

    // メッシュ
    this.box = new THREE.Mesh(this.geometry, this.material)
    this.scene.add(this.box)

    // コントロール
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    // ヘルパー
    const axesBarLength = 5.0
    this.axesHelper = new THREE.AxesHelper(axesBarLength)
    this.scene.add(this.axesHelper)
  }

  /**
   * 描画処理
   */
  render () {
    // ループの設定
    // 引数から受け取った関数を、スクリーンの更新のタイミングに合わせて呼び出してくれる
    // ディスプレイのリフレッシュレート（60fps）に合わせて呼び出す
    // 1秒間に60回呼び出される
    // requestAnimationFrameは、関数を呼び出す際、グローバルスコープでその関数を実行する
    requestAnimationFrame(this.render)

    // コントロールを更新
    this.controls.update()

    // フラグに応じてオブジェクトの状態を変化させる @@@
    if (this.isDown === true) {
      // rotation プロパティは Euler（オイラー）クラスのインスタンス
      // XYZ の各軸に対する回転をラジアンで指定する
      // y軸を中心に回転させる
      // 右ネジの法則で巻いてる方向が+になる
      // three.jsでは、Object3Dという基底クラスがある
      // このクラスに属するインスタンスは皆rotationなどの便利なプロパティを持つ
      // メッシュやカメラは、いずれもObject3Dを継承している
      this.box.rotation.y += 0.05
    }

    // レンダラーで描画
    // シーンにはBoxジオメトリから作ったメッシュが一つ入っている
    this.renderer.render(this.scene, this.camera)
  }
}
