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
      // fovy は Field of View Y のことで、縦方向の視野角を意味する
      fovy: 60,
      // 描画する空間のアスペクト比（縦横比）
      aspect: window.innerWidth / window.innerHeight,
      // 描画する空間のニアクリップ面（最近面）
      near: 0.1,
      // 描画する空間のファークリップ面（最遠面）
      // ニアクリップ面とファークリップ面の外にあるメッシュは見えなくなる
      far: 50.0,
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
      // レンダラーが背景をリセットする際に使われる背景色
      clearColor: '#fff',
      // レンダラーが描画する領域の横幅
      width: window.innerWidth,
      // レンダラーが描画する領域の縦幅
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

    // リサイズイベント
    window.addEventListener('resize', () => {
      // レンダラの大きさを設定
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      // カメラが撮影する視錐台のアスペクト比を再設定
      this.camera.aspect = window.innerWidth / window.innerHeight
      // カメラのパラメータが変更されたときは行列を更新する
      this.camera.updateProjectionMatrix()
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

    // マテリアル---------
    this.mandysPink = new THREE.MeshToonMaterial({ color: '#f6bd98' })
    this.fawn = new THREE.MeshToonMaterial({ color: '#eba276' })
    this.volcano = new THREE.MeshToonMaterial({ color: '#4e2a24' })
    this.sealBrown = new THREE.MeshToonMaterial({ color: '#2d1715' })
    this.wewak = new THREE.MeshToonMaterial({ color: '#f59898' })
    this.onyx = new THREE.MeshToonMaterial({ color: '#111' })
    this.nightShadz = new THREE.MeshToonMaterial({ color: '#a23b4b' })
    this.claret = new THREE.MeshToonMaterial({ color: '#6b2633' })

    // ジオメトリ---------
    this.boxGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1)

    // メッシュ------------
    // 肌、明るい
    this.skinBright1 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright2 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright3 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright4 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright5 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright6 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright7 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright8 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright9 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright10 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright11 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright12 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright13 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright14 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright15 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright16 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright17 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright18 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright19 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright20 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright21 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright22 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright23 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright24 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright25 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright26 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright27 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright28 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright29 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright30 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright31 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright32 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright33 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright34 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright35 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright36 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright37 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright38 = new THREE.Mesh(this.boxGeometry, this.mandysPink)
    this.skinBright39 = new THREE.Mesh(this.boxGeometry, this.mandysPink)

    // 肌、暗い
    this.skinDark1 = new THREE.Mesh(this.boxGeometry, this.fawn)
    this.skinDark2 = new THREE.Mesh(this.boxGeometry, this.fawn)
    this.skinDark3 = new THREE.Mesh(this.boxGeometry, this.fawn)
    this.skinDark4 = new THREE.Mesh(this.boxGeometry, this.fawn)
    this.skinDark5 = new THREE.Mesh(this.boxGeometry, this.fawn)
    this.skinDark6 = new THREE.Mesh(this.boxGeometry, this.fawn)

    // 肌、ピンク
    this.skinPink1 = new THREE.Mesh(this.boxGeometry, this.wewak)
    this.skinPink2 = new THREE.Mesh(this.boxGeometry, this.wewak)
    this.skinPink3 = new THREE.Mesh(this.boxGeometry, this.wewak)
    this.skinPink4 = new THREE.Mesh(this.boxGeometry, this.wewak)
    this.skinPink5 = new THREE.Mesh(this.boxGeometry, this.wewak)
    this.skinPink6 = new THREE.Mesh(this.boxGeometry, this.wewak)
    this.skinPink7 = new THREE.Mesh(this.boxGeometry, this.wewak)
    this.skinPink8 = new THREE.Mesh(this.boxGeometry, this.wewak)

    // 口、
    this.mouth1 = new THREE.Mesh(this.boxGeometry, this.volcano)
    this.mouth2 = new THREE.Mesh(this.boxGeometry, this.sealBrown)
    this.mouth3 = new THREE.Mesh(this.boxGeometry, this.volcano)

    // 目
    this.eye1 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.eye2 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.eye3 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.eye4 = new THREE.Mesh(this.boxGeometry, this.onyx)

    // 髪
    this.hair1 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.hair2 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.hair3 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.hair4 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.hair5 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.hair6 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.hair7 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.hair8 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.hair9 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.hair10 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.hair11 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.hair12 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.hair13 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.hair14 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.hair15 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.hair16 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.hair17 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.hair18 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.hair19 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.hair20 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.hair21 = new THREE.Mesh(this.boxGeometry, this.onyx)
    this.hair22 = new THREE.Mesh(this.boxGeometry, this.onyx)

    // 帽子
    this.hat1 = new THREE.Mesh(this.boxGeometry, this.nightShadz)
    this.hat2 = new THREE.Mesh(this.boxGeometry, this.nightShadz)
    this.hat3 = new THREE.Mesh(this.boxGeometry, this.nightShadz)
    this.hat4 = new THREE.Mesh(this.boxGeometry, this.nightShadz)
    this.hat5 = new THREE.Mesh(this.boxGeometry, this.claret)
    this.hat6 = new THREE.Mesh(this.boxGeometry, this.nightShadz)

    this.scene.add(this.hat1)
    this.scene.add(this.hat2)
    this.scene.add(this.hat3)
    this.scene.add(this.hat4)
    this.scene.add(this.hat5)
    this.scene.add(this.hat6)

    // 位置

    this.hat1.position.set(0.0, 0.8, 0.0)
    this.hat2.position.set(0.1, 0.8, 0.0)
    this.hat3.position.set(0.2, 0.8, 0.0)
    this.hat4.position.set(0.3, 0.8, 0.0)
    this.hat5.position.set(0.4, 0.8, 0.0)
    this.hat6.position.set(0.5, 0.8, 0.0)

    this.skinBright1.position.set(-0.1, 0.0, 0.0)
    this.skinBright3.position.set(0.1, 0.0, 0.0)
    this.skinBright4.position.set(0.2, 0.1, 0.0)
    this.skinBright5.position.set(-0.2, 0.1, 0.0)
    this.skinBright6.position.set(-0.3, 0.1, 0.0)
    this.skinBright7.position.set(0.3, 0.1, 0.0)
    this.skinBright8.position.set(0.2, 0.2, 0.0)
    this.skinBright9.position.set(0.1, 0.2, 0.0)
    this.skinBright10.position.set(0.0, 0.2, 0.0)
    this.skinBright11.position.set(-0.1, 0.2, 0.0)
    this.skinBright12.position.set(-0.2, 0.2, 0.0)
    this.skinBright13.position.set(-0.2, 0.3, 0.0)
    this.skinBright14.position.set(-0.1, 0.3, 0.0)
    this.skinBright15.position.set(0.0, 0.3, 0.0)
    this.skinBright16.position.set(0.1, 0.3, 0.0)
    this.skinBright17.position.set(0.2, 0.3, 0.0)
    this.skinBright18.position.set(-0.1, 0.4, 0.0)
    this.skinBright19.position.set(-0.1, 0.5, 0.0)
    this.skinBright20.position.set(0.0, 0.4, 0.0)
    this.skinBright21.position.set(0.0, 0.5, 0.0)
    this.skinBright22.position.set(0.1, 0.4, 0.0)
    this.skinBright23.position.set(0.1, 0.5, 0.0)
    this.skinBright24.position.set(0.3, 0.4, 0.0)
    this.skinBright25.position.set(0.4, 0.4, 0.0)
    this.skinBright26.position.set(0.4, 0.5, 0.0)
    this.skinBright27.position.set(0.3, 0.5, 0.0)
    this.skinBright28.position.set(-0.3, 0.4, 0.0)
    this.skinBright29.position.set(-0.4, 0.4, 0.0)
    this.skinBright30.position.set(-0.4, 0.5, 0.0)
    this.skinBright31.position.set(-0.3, 0.5, 0.0)
    this.skinBright32.position.set(-0.5, 0.4, 0.0)
    this.skinBright33.position.set(-0.5, 0.3, 0.0)
    this.skinBright34.position.set(-0.6, 0.5, 0.0)
    this.skinBright35.position.set(-0.6, 0.4, 0.0)
    this.skinBright36.position.set(0.5, 0.4, 0.0)
    this.skinBright37.position.set(0.5, 0.3, 0.0)
    this.skinBright38.position.set(0.6, 0.5, 0.0)
    this.skinBright39.position.set(0.6, 0.4, 0.0)

    this.skinDark1.position.set(-0.2, 0.0, 0.0)
    this.skinDark2.position.set(0.2, 0.0, 0.0)
    this.skinDark3.position.set(-0.2, 0.6, 0.0)
    this.skinDark4.position.set(-0.3, 0.6, 0.0)
    this.skinDark5.position.set(0.2, 0.6, 0.0)
    this.skinDark6.position.set(0.3, 0.6, 0.0)

    this.mouth1.position.set(0.1, 0.1, 0.0)
    this.mouth2.position.set(0.0, 0.1, 0.0)
    this.mouth3.position.set(-0.1, 0.1, 0.0)

    this.skinPink1.position.set(0.4, 0.2, 0.0)
    this.skinPink2.position.set(0.3, 0.2, 0.0)
    this.skinPink3.position.set(0.3, 0.3, 0.0)
    this.skinPink4.position.set(0.4, 0.3, 0.0)
    this.skinPink5.position.set(-0.4, 0.2, 0.0)
    this.skinPink6.position.set(-0.3, 0.2, 0.0)
    this.skinPink7.position.set(-0.3, 0.3, 0.0)
    this.skinPink8.position.set(-0.4, 0.3, 0.0)

    this.eye1.position.set(-0.2, 0.4, 0.0)
    this.eye2.position.set(-0.2, 0.5, 0.0)
    this.eye3.position.set(0.2, 0.4, 0.0)
    this.eye4.position.set(0.2, 0.5, 0.0)

    this.hair1.position.set(0.4, 0.6, 0.0)
    this.hair2.position.set(0.5, 0.6, 0.0)
    this.hair3.position.set(0.5, 0.5, 0.0)
    this.hair4.position.set(0.6, 0.6, 0.0)
    this.hair5.position.set(0.5, 0.7, 0.0)
    this.hair6.position.set(0.4, 0.7, 0.0)
    this.hair7.position.set(0.3, 0.7, 0.0)
    this.hair8.position.set(0.2, 0.7, 0.0)
    this.hair9.position.set(0.1, 0.7, 0.0)
    this.hair10.position.set(0.1, 0.6, 0.0)
    this.hair11.position.set(0.0, 0.6, 0.0)
    this.hair12.position.set(-0.1, 0.6, 0.0)
    this.hair13.position.set(0.0, 0.7, 0.0)
    this.hair14.position.set(-0.1, 0.7, 0.0)
    this.hair15.position.set(-0.2, 0.7, 0.0)
    this.hair16.position.set(-0.3, 0.7, 0.0)
    this.hair17.position.set(-0.4, 0.7, 0.0)
    this.hair18.position.set(-0.4, 0.6, 0.0)
    this.hair19.position.set(-0.5, 0.7, 0.0)
    this.hair20.position.set(-0.5, 0.6, 0.0)
    this.hair21.position.set(-0.5, 0.5, 0.0)
    this.hair22.position.set(-0.6, 0.6, 0.0)

    // シーンへの追加

    this.scene.add(this.skinBright1)
    this.scene.add(this.skinBright2)
    this.scene.add(this.skinBright3)
    this.scene.add(this.skinBright4)
    this.scene.add(this.skinBright5)
    this.scene.add(this.skinBright6)
    this.scene.add(this.skinBright7)
    this.scene.add(this.skinBright8)
    this.scene.add(this.skinBright9)
    this.scene.add(this.skinBright10)
    this.scene.add(this.skinBright11)
    this.scene.add(this.skinBright12)
    this.scene.add(this.skinBright13)
    this.scene.add(this.skinBright14)
    this.scene.add(this.skinBright15)
    this.scene.add(this.skinBright16)
    this.scene.add(this.skinBright17)
    this.scene.add(this.skinBright18)
    this.scene.add(this.skinBright19)
    this.scene.add(this.skinBright20)
    this.scene.add(this.skinBright21)
    this.scene.add(this.skinBright22)
    this.scene.add(this.skinBright23)
    this.scene.add(this.skinBright24)
    this.scene.add(this.skinBright25)
    this.scene.add(this.skinBright26)
    this.scene.add(this.skinBright27)
    this.scene.add(this.skinBright28)
    this.scene.add(this.skinBright29)
    this.scene.add(this.skinBright30)
    this.scene.add(this.skinBright31)
    this.scene.add(this.skinBright32)
    this.scene.add(this.skinBright33)
    this.scene.add(this.skinBright34)
    this.scene.add(this.skinBright35)
    this.scene.add(this.skinBright36)
    this.scene.add(this.skinBright37)
    this.scene.add(this.skinBright38)
    this.scene.add(this.skinBright39)

    this.scene.add(this.skinDark1)
    this.scene.add(this.skinDark2)
    this.scene.add(this.skinDark3)
    this.scene.add(this.skinDark4)
    this.scene.add(this.skinDark5)
    this.scene.add(this.skinDark6)

    this.scene.add(this.skinPink1)
    this.scene.add(this.skinPink2)
    this.scene.add(this.skinPink3)
    this.scene.add(this.skinPink4)
    this.scene.add(this.skinPink5)
    this.scene.add(this.skinPink6)
    this.scene.add(this.skinPink7)
    this.scene.add(this.skinPink8)

    this.scene.add(this.mouth1)
    this.scene.add(this.mouth2)
    this.scene.add(this.mouth3)

    this.scene.add(this.eye1)
    this.scene.add(this.eye2)
    this.scene.add(this.eye3)
    this.scene.add(this.eye4)

    this.scene.add(this.hair1)
    this.scene.add(this.hair2)
    this.scene.add(this.hair3)
    this.scene.add(this.hair4)
    this.scene.add(this.hair5)
    this.scene.add(this.hair6)
    this.scene.add(this.hair7)
    this.scene.add(this.hair8)
    this.scene.add(this.hair9)
    this.scene.add(this.hair10)
    this.scene.add(this.hair11)
    this.scene.add(this.hair12)
    this.scene.add(this.hair13)
    this.scene.add(this.hair14)
    this.scene.add(this.hair15)
    this.scene.add(this.hair16)
    this.scene.add(this.hair17)
    this.scene.add(this.hair18)
    this.scene.add(this.hair19)
    this.scene.add(this.hair20)
    this.scene.add(this.hair21)
    this.scene.add(this.hair22)

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
      // メッシュやカメラは、いずれもObject3Dを継承している
    }
    // レンダラーで描画
    this.renderer.render(this.scene, this.camera)
  }
}
