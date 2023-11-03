//We copied this code, we are so sorry, but we cannot find where from anymore.
//If this is your code, please claim it and let us know. We will give you credit.

import React, { Component } from 'react'
import uuid from 'react-uuid'
// import Modal from '../components/Modal'
import './css/Game.2048.css'
import { Button, Card, createTheme, Modal, PaletteMode } from "@mui/material";
import swal from "sweetalert";
import { CardHeader } from "@material-ui/core";
import call from "../../services/api-call";
import { getAllTokens } from "../../theme";
import { ca } from 'date-fns/locale';
// import Modal from "./Modal"

const tileColors = ['#fffcbb', '#FFFCAB', '#ffef62', '#63a4f8', '#3D8EF7', '#2a63ac', '#84E8A2', '#29C18C', '#1c8762', '#af52bf', '#9c27b0', '#6d1b7b']
const tileMargin = 10
const tileSize = 100

class Tile {
  constructor(props) {
    this.x = props.x
    this.y = props.y
    this.n = props.n
    this.isNew = true
    this.isMerged = false
    this.destroyed = false
    this.calcProps()
  }

  calcProps = () => {
    this.ind = this.x * 4 + this.y
    this.top = this.x * (tileSize + tileMargin) + 1.5 * tileMargin
    this.left = this.y * (tileSize + tileMargin) + 1.5 * tileMargin
    this.transform = "translate( " + this.left + "px , " + this.top + "px )"
    this.number = 2 ** this.n
    this.color = this.n >= tileColors.length ? tileColors[0] : tileColors[this.n]
    this.fontColor = this.n == 1 ? "#1c1c1a" : "#1c1c1a"
    this.fontSize = this.n < 10 ? "3rem" : ((this.n < 14) ? "2.2rem" : "1.8rem")
  }
}

export class TwentyFortyEight extends Component {
  constructor(props) {
    super(props)

    const userPref = localStorage.getItem('theme');

    this.state = {
      tiles: {},
      score: 0,
      modal: {
        show: false,
        buttons: []
      },
      mode: userPref === 'light' ? 'light' : 'dark',
      gameOver: false,
      highScore: this.props.highScore,
    }

    this.backgroundTiles = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        this.backgroundTiles.push([i, j])
      }
    }

    this.mainElement = React.createRef()
  }


  valid = new Array(16).fill(true)
  validCount = 16

  numbers = new Array(16).fill(0)
  numToTile = new Array(16).fill(-1)

  isGameOver = false

  startSwipeX = 0
  startSwipeY = 0

  showModal = (title, content, buttons) => {
    if ((typeof content) === "function") {
      content = content()
    }
    this.setState({
      modal: {
        show: true,
        title,
        content,
        buttons,
        close: this.closeModal
      }
    })
  }

  closeModal = () => {
    this.setState({
      modal: {
        show: false,
        buttons: []
      }
    })
  }

  gameOver = () => {

    let nhs = false
    // if (this.state.score > this.props.highscore[this.props.gameCode]) {
    //   this.props.highscoreUpdate({gameCode: this.props.gameCode, score: this.state.score})
    //   nhs = true
    // }
    this.showModal("Game Over", (
      <div>
        <h4 className="text-center">Game Over</h4>
        <br />
        <div className="row">
          <div className="col">
            <p className="text-right">Score:</p>
          </div>
          <div className="col">
            <p>{this.state.score}</p>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <p className="text-right">High Score:</p>
          </div>
          <div className="col">
            {/*<p>{nhs ? this.state.score : this.props.highscore[this.props.gameCode]}</p>*/}
          </div>
        </div>
      </div>
    ), [
      {
        type: "primary",
        text: "Select Game",
        // callback: this.props.leaveGame
      },
      {
        type: "success",
        text: "Play Again",
        callback: () => {
          this.closeModal()
          this.init()
        }
      },
      {
        type: "secondary",
        text: "Close",
        callback: this.closeModal
      }
    ])
  }

  addScore = (num) => {
    // console.log("num is: ", num)
    // if (this.state.score + 2 ** num > this.props.highScore){
    //   console.log("high score")
    //   this.setState({
    //     score: this.state.score + 2 ** num
    //   })
    //   this.setHighestScore(this.state.score + 2 ** num)
    //   if (this.props.scoreCallback !== null) {
    //     this.props.scoreCallback(this.state.score)
    //   }
    // } else {
    //   this.setState({
    //     score: this.state.score + 2 ** num
    //   })
    //   if (this.props.scoreCallback !== null) {
    //     this.props.scoreCallback(this.state.score)
    //   }
    // }
    this.setState({
      score: this.state.score + 2 ** num
    })
    if (this.props.scoreCallback !== null) {
      this.props.scoreCallback(this.state.score)
    }
  }


  setHighestScore = async (num) => {
    let res = await call(
      "/api/workspace/setHighestScore",
      "post",
      null,
      null,
      null,
      // @ts-ignore
      {
        highest_score: num.toString(),
      }
    )

    if (res === undefined || res["message"] === undefined || res["message"] !== "success") {
      swal("Unable to set highest score. Please try again.")
    } else {
      this.setState({
        highScore: num
      })
    }
  }

  generateTiles = () => {
    //console.log("Generate tiles...")
    if (this.isGameOver) {
      return
    }

    let tls = this.state.tiles

    let howMany = Math.min(Math.random() > 0.9 ? 2 : 1, this.validCount)
    do {
      let ri = Math.floor(Math.random() * 16)
      while (!this.valid[ri]) {
        ri = Math.floor(Math.random() * 16)
      }
      let rn = Math.random() > 0.9 ? 2 : 1;

      let uni = uuid()
      tls[uni] = new Tile({ x: parseInt(ri / 4), y: ri % 4, n: rn })
      this.valid[ri] = false
      this.validCount--
      this.numbers[ri] = rn
      this.numToTile[ri] = uni
      //console.log("+"+ri)
      howMany--
    } while (howMany > 0 && this.validCount > 0)

    this.setState({
      tiles: tls
    })

    if (this.validCount == 0) {
      //check gameover
      let hasMerge = false;
      for (let i = 0; i < 16; i++) {
        if (i % 4 != 3 && this.numbers[i] == this.numbers[i + 1]) {
          hasMerge = true;
          break;
        }
        if (i < 12 && this.numbers[i] == this.numbers[i + 4]) {
          hasMerge = true;
          break;
        }
      }
      console.log("merge: ", hasMerge)
      console.log("highest score: ", this.props.highScore)
      console.log("score: ", this.state.score)
      if (!hasMerge) {
        // if (this.props.highScore < this.state.score){
        //   this.setHighestScore(this.state.score)
        // }
        // setTimeout(this.gameOver, 1000);
        this.setState({ gameOver: true })
      }
    }
  }

  move = (dx, dy) => {
    if (this.isGameOver) return
    let tls = this.state.tiles
    for (let i in tls) {
      if (tls[i].destroyed || tls[i].isMerged) {
        delete tls[i]
      } else {
        if (tls[i].isNew) tls[i].isNew = false
      }
    }
    let moved = false
    let mergedTiles = {}
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let k = (dx > 0 ? 3 - i : i) * 4 + (dy > 0 ? 3 - j : j)
        if (this.numbers[k] !== 0) {
          let lastOne = -1
          if (!dy) {
            for (let m = k; m < 16 && m >= 0; m += dx * 4) {
              if (m === k) continue
              if (this.numbers[m] !== 0) {
                if (this.numbers[m] === this.numbers[k] && (!mergedTiles[m])) {
                  //console.log("+"+m+" -"+k)
                  this.numbers[m]++
                  this.numbers[k] = 0

                  let mgid = uuid()
                  tls[mgid] = new Tile({
                    x: tls[this.numToTile[m]].x,
                    y: tls[this.numToTile[m]].y,
                    n: tls[this.numToTile[m]].n + 1
                  })
                  tls[mgid].isNew = false
                  tls[mgid].isMerged = true

                  tls[this.numToTile[m]].n++
                  tls[this.numToTile[m]].calcProps()

                  tls[this.numToTile[k]].n++
                  tls[this.numToTile[k]].x = tls[this.numToTile[m]].x
                  tls[this.numToTile[k]].y = tls[this.numToTile[m]].y
                  tls[this.numToTile[k]].calcProps()

                  tls[this.numToTile[k]].destroyed = true
                  this.numToTile[k] = -1

                  this.valid[k] = true
                  this.validCount++

                  lastOne = -1

                  moved = true
                  mergedTiles[m] = true

                  this.addScore(tls[this.numToTile[m]].n);
                }
                break
              }
              lastOne = m
            }
          } else {
            for (let m = k; m >= parseInt(k / 4) * 4 && m < parseInt(k / 4 + 1) * 4; m += dy) {
              if (m === k) continue
              if (this.numbers[m] !== 0) {
                if (this.numbers[m] === this.numbers[k] && (!mergedTiles[m])) {
                  //console.log("+"+m+" -"+k)
                  this.numbers[m]++
                  this.numbers[k] = 0

                  let mgid = uuid()
                  tls[mgid] = new Tile({
                    x: tls[this.numToTile[m]].x,
                    y: tls[this.numToTile[m]].y,
                    n: tls[this.numToTile[m]].n + 1
                  })
                  tls[mgid].isNew = false
                  tls[mgid].isMerged = true

                  tls[this.numToTile[m]].n++
                  tls[this.numToTile[m]].calcProps()

                  tls[this.numToTile[k]].n++
                  tls[this.numToTile[k]].x = tls[this.numToTile[m]].x
                  tls[this.numToTile[k]].y = tls[this.numToTile[m]].y
                  tls[this.numToTile[k]].calcProps()

                  tls[this.numToTile[k]].destroyed = true
                  this.numToTile[k] = -1

                  this.valid[k] = true
                  this.validCount++

                  lastOne = -1

                  moved = true
                  mergedTiles[m] = true

                  this.addScore(tls[this.numToTile[m]].n);
                }
                break
              }
              lastOne = m
            }
          }
          if (lastOne !== -1) {
            //console.log(k+"-->"+lastOne)
            this.numbers[lastOne] = this.numbers[k]
            this.numbers[k] = 0
            this.numToTile[lastOne] = this.numToTile[k]
            this.numToTile[k] = -1

            let nx = parseInt(lastOne / 4)
            let ny = lastOne % 4

            tls[this.numToTile[lastOne]].x = nx
            tls[this.numToTile[lastOne]].y = ny
            tls[this.numToTile[lastOne]].calcProps()

            this.valid[k] = true
            this.valid[lastOne] = false

            moved = true
          }
        }
      }
    }

    this.setState({
      tiles: tls
    })

    if (moved) this.generateTiles()
  }

  init = () => {

    this.valid = new Array(16).fill(true)
    this.validCount = 16
    this.numbers = new Array(16).fill(0)
    this.numToTile = new Array(16).fill(-1)
    this.isGameOver = false

    // //load highscore
    // let hs = this.props.highscore[this.props.gameCode]
    // if (hs === null || (typeof hs) !== "number") {
    //   this.props.highscoreUpdate({gameCode: this.props.gameCode, score: 0})
    // }

    //scale game to window size
    // let tm = (window.innerWidth - 40) / (tileSize * 4 + tileMargin * 6);
    // let dm = (window.innerHeight - 60 - 60 - 40) / (tileSize * 4 + tileMargin * 6);
    /// width 40 height 160
    let tm = ((window.innerWidth - 20) / (tileSize * 4 + tileMargin * 6)) * .65;
    let dm = ((window.innerHeight - 80) / (tileSize * 4 + tileMargin * 6) * .65);
    this.mainElement.current.style.transform = "scale(" + Math.min(tm, dm) + ")";
    this.mainElement.current.style.left = "calc( 50% - " + (Math.min(tm, dm) * (tileSize * 4 + tileMargin * 5) / 2) + "px )";

    this.state = {
      tiles: {},
      score: 0,
      modal: {
        show: false,
        buttons: []
      }
    }
    this.forceUpdate()

    this.setState({
      score: 0
    })

    this.generateTiles()
  }

  keyDown = (e) => {
    switch (e.keyCode) {
      case 37: //left
        this.move(0, -1)
        break
      case 39: //right
        this.move(0, 1)
        break
      case 38: //up
        this.move(-1, 0)
        break
      case 40: //down
        this.move(1, 0)
        break
      case 65: //left
        this.move(0, -1)
        break
      case 68: //right
        this.move(0, 1)
        break
      case 87: //up
        this.move(-1, 0)
        break
      case 83: //down
        this.move(1, 0)
        break
      default:
        break
    }
  }

  touchStart = (e) => {
    this.startSwipeX = e.touches[0].clientX;
    this.startSwipeY = e.touches[0].clientY;
  }

  touchSwipe = (e) => {
    const deltaX = e.changedTouches[0].clientX - this.startSwipeX;
    const deltaY = e.changedTouches[0].clientY - this.startSwipeY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > absDeltaY) {
      // Horizontal movement is greater than vertical movement
      if (deltaX > 0) {
        this.move(0, 1);
      } else {
        this.move(0, -1);
      }
    } else {
      // Vertical movement is greater than horizontal movement
      if (deltaY > 0) {
        this.move(1, 0);
      } else {
        this.move(-1, 0);
      }
    }
  }

  componentDidMount() {

    this.keyDownListener = window.addEventListener("keydown", this.keyDown)
    this.swipeListenerStart = window.addEventListener("touchstart", this.touchStart)
    this.swipeListenerEnd = window.addEventListener("touchend", this.touchSwipe)


    this.init()
  }

  componentWillUnmount() {

    window.removeEventListener("keydown", this.keyDownListener)
    window.removeEventListener("touchstart", this.touchStart)
    window.removeEventListener("touchend", this.touchSwipe)
    // this.props.leaveGame()
  }

  renderDesktopHeader = () => {
    return (
      <Card
        sx={{
          width: (tileSize * 4 + tileMargin * 6),
          height: "90px",
          borderRadius: 1,
          backgroundColor: this.state.mode === "light" ? "white" : "#282826",
          marginBottom: "10px"
        }}
      >
        {/*{this.state.gameOver ? (*/}
        {/*  <h4 style={{width: "100%", display: "flex", justifyContent: "center"}}>Game Over</h4>*/}
        {/*) : (<div/>)}*/}
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <Button onClick={() => this.init()}>
            Restart Game
          </Button>
        </div>
        <div style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-around", alignItems: "center", height: "50%" }}>
          <div className="row" style={{ width: "100px", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            <div className="col">
              <p className="text-right">Score:</p>
            </div>
            <div className="col">
              <p>{this.state.score}</p>
            </div>
          </div>
          <div className="row" style={{ width: "200px", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            <div className="col">
              <p className="text-right">High Score:</p>
            </div>
            <div className="col" style={{ display: "flex", alignItems: "center" }}>
              {this.props.highScore}
              {/*<p>{nhs ? this.state.score : this.props.highscore[this.props.gameCode]}</p>*/}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  renderMobileHeader = () => {
    return (
      <Card
        sx={{
          width: (window.innerWidth < 500) ? ((window.innerWidth - 20) / (tileSize * 4 + tileMargin * 6)) * .75 : undefined,
          height: "90px",
          borderRadius: 1,
          backgroundColor: this.state.mode === "light" ? "white" : "#282826",
          marginBottom: "10px",
          marginLeft: (window.innerWidth < 500) ? "98px" : 0
        }}
      >
        {/*{this.state.gameOver ? (*/}
        {/*  <h4 style={{width: "100%", display: "flex", justifyContent: "center"}}>Game Over</h4>*/}
        {/*) : (<div/>)}*/}
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <Button onClick={() => this.init()}>
            Restart Game
          </Button>
        </div>
        <div style={{ width: "100%", display: "flex", flexDirection: (window.innerWidth > 500) ? "row" : "column", justifyContent: "space-around", alignItems: "center", height: "50%" }}>
          <div className="row" style={{ width: "100px", display: "flex", flexDirection: "row", justifyContent: "space-between", height: (window.innerWidth < 500) ? "25px" : undefined }}>
            <div className="col">
              <p className="text-right">Score:</p>
            </div>
            <div className="col">
              <p>{this.state.score}</p>
            </div>
          </div>
          <div className="row" style={{ width: "200px", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            <div className="col">
              <p className="text-right">High Score:</p>
            </div>
            <div className="col" style={{ display: "flex", alignItems: "center" }}>
              {this.props.highScore}
              {/*<p>{nhs ? this.state.score : this.props.highscore[this.props.gameCode]}</p>*/}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  render() {
    return (
      <div>
        {window.innerWidth > 1000 ? this.renderDesktopHeader() : this.renderMobileHeader()}
        <div className="arcade-2048-outer">
          <div className="arcade-2048-game" ref={this.mainElement} style={{
            width: (tileSize * 4 + tileMargin * 6),
            height: (tileSize * 4 + tileMargin * 6),
            backgroundColor: this.state.mode === "light" ? "white" : "#282826"
          }}>
            {
              Object.entries(this.state.tiles).map(([ind, v]) => (
                <div className={"arcade-2048-tile" + (v.isNew ? " new" : "") + (v.isMerged ? " merged" : "")} key={ind}
                  style={{
                    width: (tileSize + 1) + "px",
                    height: (tileSize + 1) + "px",
                    transform: v.transform,
                    backgroundColor: v.color,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: v.fontColor,
                    fontSize: tileSize / 45 + "em"
                  }}>
                  {
                    v.isMerged ? (<div className="arcade-2048-tile-inner">{v.number}</div>) : v.number
                  }
                </div>
              ))
            }
            {
              this.backgroundTiles.map((v, ind) => (
                <div className="arcade-2048-tile-background" key={ind} style={{
                  width: (tileSize + 1) + "px",
                  height: (tileSize + 1) + "px",
                  top: (tileMargin * 1.5 + (tileSize + tileMargin) * v[0]) + "px",
                  left: (tileMargin * 1.5 + (tileSize + tileMargin) * v[1]) + "px"
                }}></div>
              ))
            }
          </div>
        </div>
      </div>
    )
  }
}

export default TwentyFortyEight