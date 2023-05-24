// = 007 ======================================================================
// three.js にはたくさんの組み込みジオメトリがあります。
// これまでのサンプルでは一貫してボックスばかり使っていましたが、代表的なその他
// のジオメトリについてもここで試してみましょう。
// 引数がそれぞれどういった意味を持っているのか疑問に思ったときは、公式のドキュ
// メント等を参考にしましょう。
// three.js docs - https://threejs.org/docs/index.html
//
// ちなみに、ここでは「マテリアルについては同じものを使いまわしている」という点
// も地味に重要です。個別に色や質感を変えたい場合は、もちろん別々のマテリアルを
// 使っても問題はありませんが、同じ質感であればマテリアルは再利用することで無駄
// なくプログラムを組むことができますし、メモリなども節約できます。
// ※逆に質感を変えたい場合はマテリアルは使い回すのではなく複数用意します
// ============================================================================

// 必要なモジュールを読み込み
import * as THREE from '../../lib/three.module.js'
import { OrbitControls } from '../../lib/OrbitControls.js'

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
   * ディレクショナルライト定義のための定数
   */
  static get DIRECTIONAL_LIGHT_PARAM () {
    return {
      color: 0xffffff, // 光の色
      intensity: 1.0,  // 光の強度
      x: 1.0,          // 光の向きを表すベクトルの X 要素
      y: 1.0,          // 光の向きを表すベクトルの Y 要素
      z: 1.0           // 光の向きを表すベクトルの Z 要素
    }
  }

  /**
   * アンビエントライト定義のための定数
   */
  static get AMBIENT_LIGHT_PARAM () {
    return {
      color: 0xffffff, // 光の色
      intensity: 0.2,  // 光の強度
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
    this.renderer         // レンダラ
    this.scene            // シーン
    this.camera           // カメラ
    this.directionalLight // ディレクショナルライト
    this.ambientLight     // アンビエントライト
    this.material         // マテリアル
    this.boxGeometry      // ボックスジオメトリ
    this.box              // ボックスメッシュ
    this.sphereGeometry   // スフィアジオメトリ
    this.sphere           // スフィアメッシュ
    this.torusGeometry    // トーラスジオメトリ
    this.torus            // トーラスメッシュ
    this.coneGeometry     // コーンジオメトリ
    this.cone             // コーンメッシュ
    this.controls         // オービットコントロール
    this.axesHelper       // 軸ヘルパー

    this.isDown = false // キーの押下状態を保持するフラグ

    // render メソッドはブラウザ制御で再帰的に呼び出されるので this を固定する
    this.render = this.render.bind(this)

    // キーの押下や離す操作を検出できるようにする
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

    // ディレクショナルライト（平行光源）
    this.directionalLight = new THREE.DirectionalLight(
      App3.DIRECTIONAL_LIGHT_PARAM.color,
      App3.DIRECTIONAL_LIGHT_PARAM.intensity
    )
    this.directionalLight.position.set(
      App3.DIRECTIONAL_LIGHT_PARAM.x,
      App3.DIRECTIONAL_LIGHT_PARAM.y,
      App3.DIRECTIONAL_LIGHT_PARAM.z,
    )
    this.scene.add(this.directionalLight)

    // アンビエントライト（環境光）
    this.ambientLight = new THREE.AmbientLight(
      App3.AMBIENT_LIGHT_PARAM.color,
      App3.AMBIENT_LIGHT_PARAM.intensity,
    )
    this.scene.add(this.ambientLight)

    // ジオメトリ
    this.geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0)

    // マテリアル
    // - 反射光を表現できるマテリアル -----------------------------------------
    // MeshLambertMaterial は拡散光を表現できますが、MeshPhongMaterial を利用す
    // ると拡散光に加えて反射光を表現することができます。
    // 反射光の外見上の特徴としては、拡散光よりもより強いハイライトが入ります。
    // また、視点（カメラ）の位置によって見え方に変化が表れるのも拡散光には見ら
    // れない反射光ならではの現象です。
    // ------------------------------------------------------------------------
    this.material = new THREE.MeshPhongMaterial(App3.MATERIAL_PARAM)

    // 各種ジオメトリからメッシュを生成する
    this.boxGeometry = new THREE.BoxGeometry(1.0, 1.0, 1.0)
    this.box = new THREE.Mesh(this.boxGeometry, this.material)
    this.scene.add(this.box)
    this.sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16)
    this.sphere = new THREE.Mesh(this.sphereGeometry, this.material)
    this.scene.add(this.sphere)
    this.torusGeometry = new THREE.TorusGeometry(0.5, 0.2, 8, 16)
    this.torus = new THREE.Mesh(this.torusGeometry, this.material)
    this.scene.add(this.torus)
    this.coneGeometry = new THREE.ConeGeometry(0.5, 1.0, 16)
    this.cone = new THREE.Mesh(this.coneGeometry, this.material)
    this.scene.add(this.cone)

    // 各種メッシュは少しずつ動かしておく
    this.box.position.set(-1.0, 1.0, 0.0)
    this.sphere.position.set(1.0, 1.0, 0.0)
    this.torus.position.set(-1.0, -1.0, 0.0)
    this.cone.position.set(1.0, -1.0, 0.0)

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

    // フラグに応じてオブジェクトの状態を変化させる
    if (this.isDown === true) {
      // rotation プロパティは Euler（オイラー）クラスのインスタンス
      // XYZ の各軸に対する回転をラジアンで指定する
      // y軸を中心に回転させる
      // 右ネジの法則で巻いてる方向が+になる
      // three.jsでは、Object3Dという基底クラスがある
      // このクラスに属するインスタンスは皆rotationなどの便利なプロパティを持つ
      // メッシュやカメラは、いずれもObject3Dを継承している
      this.box.rotation.y += 0.05
      this.sphere.rotation.y += 0.05
      this.torus.rotation.y += 0.05
      this.cone.rotation.y += 0.05
    }

    // レンダラーで描画
    // シーンにはBoxジオメトリから作ったメッシュが一つ入っている
    this.renderer.render(this.scene, this.camera)
  }
}
