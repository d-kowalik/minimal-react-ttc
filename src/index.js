import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './index.css'

const lines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
]

const Square = props => (
  <button className="square" onClick={props.onClick}>
    {props.value}
  </button>
)

class Board extends Component {
  renderSquare = i => {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    )
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    )
  }
}

class Game extends Component {
  constructor(props) {
    super(props)
    this.state = {
      squares: Array(9).fill(null),
      xIsNext: true,
      busy: false,
      moves: 0,
      lastMove: 0
    }
  }

  componentDidMount() {
    this.aiMove()
  }

  aiRandom = () => {
    const squares = this.state.squares.slice()
    const possibleMoves = []
    for (const [index, square] of squares.entries())
      if (!square) possibleMoves.push(index)

    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)]
  }

  aiSense = player => {
    const squares = this.state.squares.slice()

    for (let line of lines) {
      let playerCount = 0,
        emptyCount = 0,
        placeIdx = 0
      for (let idx of line) {
        const square = squares[idx]
        if (!square) {
          emptyCount++
          placeIdx = idx
        } else if (square === player) playerCount++
      }
      if (playerCount === 2 && emptyCount === 1) return placeIdx
    }
    return null
  }

  aiWin = () => this.aiSense(this.currentPlayer())
  aiBlock = () => this.aiSense(this.currentEnemy())

  aiMove = () => {
    let move = this.aiWin()
    if (move === null) move = this.aiBlock()

    if (!this.state.moves) {
      move = 4
    }
    if (move === null) {
      if (this.state.moves === 2) {
        const { lastMove } = this.state
        // Opponent made edge move - lost completely, no more is needed except for those two ifs
        if (lastMove === 1 || lastMove === 3) {
          move = 8
        } else if (lastMove === 5 || lastMove === 7) {
          move = 0
        }
        // End of edge logic
        // Opponent marks a corner
        else if (lastMove === 0) {
          move = 8
        } else if (lastMove === 2) {
          move = 6
        } else if (lastMove === 6) {
          move = 2
        } else if (lastMove === 8) {
          move = 0
        }
      } else if (this.state.moves === 4) {
        const { lastMove } = this.state
        if (lastMove === 1 || lastMove === 3) {
          if (this.state.squares[0] === null) move = 0
          else move = 2
        } else if (lastMove === 5 || lastMove === 7) {
          if (this.state.squares[6] === null) move = 6
          else move = 0
        }
      }
    }

    if (move === null) move = this.aiRandom()

    this.makeMove(move)
    this.setState({ busy: false })
  }

  makeMove = i => {
    const squares = this.state.squares.slice()
    if (calculateWinner(squares) || squares[i]) return false
    squares[i] = this.currentPlayer()
    this.setState({
      squares,
      xIsNext: !this.state.xIsNext,
      moves: this.state.moves + 1,
      lastMove: i
    })
    return true
  }

  handleClick = i => {
    if (this.state.busy) return
    if (!this.makeMove(i)) return
    this.setState({ busy: true })
    setTimeout(this.aiMove, 200)
  }

  tie = () => {
    return this.state.moves === 9
  }

  getStatus = winner => {
    if (winner) {
      return `Wygrywa: ${winner}`
    } else if (this.tie()) {
      return 'Remis'
    }
    return `Następny gracz: ${this.currentPlayer()}`
  }

  currentPlayer = () => (this.state.xIsNext ? 'X' : 'O')
  currentEnemy = () => (this.state.xIsNext ? 'O' : 'X')

  reset = () => {
    this.setState({
      squares: Array(9).fill(null),
      xIsNext: true,
      busy: false,
      moves: 0
    })
    setTimeout(this.aiMove, 200)
  }

  render() {
    const winner = calculateWinner(this.state.squares)
    const stat = this.getStatus(winner)

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={this.state.squares}
            onClick={i => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{stat}</div>
          <button onClick={this.reset}>Restart</button>
        </div>
      </div>
    )
  }
}

ReactDOM.render(<Game />, document.getElementById('root'))

function calculateWinner(squares) {
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }
  return null
}
