// = 001 ======================================================================
// three.js サンプルの雛形。
// これは基本となる雛形サンプルなので他のサンプルよりもコメント多めになってます。
// ============================================================================

// - JavaScript にあまり詳しくない方向けの解説 --------------------------------
// JavaScript がブラウザ上で動作するとき、変数などのスコープのうち、最も広い範囲
// で有効となるグローバルスコープは「ウィンドウの名前空間」です。ちょっと別の言
// い方をすると、関数内部などではない場所（たとえばファイルの冒頭など）で唐突に
// var variable = null; のように書くと window.variable = null; と同義になります。
// ※ただし module として読み込まれている場合はモジュールレベルに閉じる
//
// JavaScript では関数のような {} を使って記述する構文で、変数のスコープが閉じら
// れます。if 文や、for 文などでも同様です。これらのことを踏まえてスクールのサン
// プルは原則として以下のようなルールで記述されています。
//
// 1. 原則としてモジュール形式で記述する
// 2. 可能な限り変数の宣言には const を使う（再代入できない変数の宣言）
// 3. 大文字のみで構成される変数・プロパティは定数的に利用する
// ----------------------------------------------------------------------------

// 必要なモジュールを読み込み
import * as THREE from '../../lib/three.module.js'

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
      clearColor: 0x666666,
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  /**
   * マテリアル定義のための定数
   */
  static get MATERIAL_PARAM () {
    return {
      color: 0x3399ff, // マテリアルの基本色
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
  }

  /**
   * 初期化処理
   */
  init () {
    // - レンダラの初期化 -----------------------------------------------------
    // レンダラ、という言葉はフロントエンドではあまり見聞きしない言葉です。わか
    // りやすく言うなら、レンダラとは「現像する人」です。カメラが撮影したフィル
    // ムを、現像してスクリーンに映してくれる役割を担います。
    // ------------------------------------------------------------------------
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setClearColor(new THREE.Color(App3.RENDERER_PARAM.clearColor))
    this.renderer.setSize(App3.RENDERER_PARAM.width, App3.RENDERER_PARAM.height)
    const wrapper = document.querySelector('#webgl')
    wrapper.appendChild(this.renderer.domElement)

    // - シーンの初期化 -------------------------------------------------------
    // Scene とは、その名のとおり 3D シーンを管理するためのものです。
    // たとえばこのシーンにはどんなオブジェクトを使うのか、あるいはどんなカメラ
    // を使って撮影を行うのかなど、描画する 3D 空間全体の情報をまとめて持ってい
    // るのが Scene オブジェクトです。
    // 3D の専門用語では、いわゆるシーングラフ（Scene Graph）と呼ばれているもの
    // で、three.js ではこれを Scene オブジェクトによって実現します。
    // ------------------------------------------------------------------------
    this.scene = new THREE.Scene()

    // - カメラの初期化 -------------------------------------------------------
    // three.js におけるカメラは、現実世界のカメラと同じように空間を撮影するため
    // に使います。
    // 現実のカメラがそうであるように、カメラの性能や、あるいは性質によって最終
    // 的に描かれる世界はまったく違ったものになります。
    // ------------------------------------------------------------------------
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

    // - ジオメトリとマテリアルの初期化 ---------------------------------------
    // ジオメトリとは、3D シーン上にオブジェクトを描くために使う「頂点」の集合体
    // です。もっと言うと、ジオメトリとは「単なる形状を定義したもの」であり、言
    // うなれば設計図、あるいは骨組みのようなものです。
    // ジオメトリはあくまでも設計図にすぎないので、これをどのように 3D 空間に配
    // 置するのかや、どのような色を塗るのかは、別の概念によって決まります。
    // three.js では、どのような色を塗るのかなど質感に関する設定はマテリアルとい
    // うオブジェクトがそれを保持するようになっています。
    // ------------------------------------------------------------------------
    this.geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0)
    this.material = new THREE.MeshBasicMaterial(App3.MATERIAL_PARAM)

    // - メッシュの初期化 -----------------------------------------------------
    // three.js では、ジオメトリとマテリアルを別々に生成し組み合わせることで 3D
    // 空間に配置することができるメッシュを定義できます。
    // 定義したメッシュは、シーンに追加することではじめて描画の対象になります。
    // ------------------------------------------------------------------------
    this.box = new THREE.Mesh(this.geometry, this.material)
    this.scene.add(this.box)
  }

  /**
   * 描画処理
   */
  render () {
    // - 描画フェーズ ---------------------------------------------------------
    // シーンに必要なオブジェクトを追加できたら、いよいよ描画です。
    // 描画を行うためには対象のシーンをレンダラでスクリーンに描画します。このと
    // き、どのカメラで描画するかを同時に指定します。
    // ------------------------------------------------------------------------
    this.renderer.render(this.scene, this.camera)
  }
}
