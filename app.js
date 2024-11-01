import { BASE_ASSET_URL } from "./src/constants.js";
import { playSound, preloadSounds } from "./src/helpers/audio.js";

const NUM_TILES = 16;

class Tile {
  constructor(id, value, matched = false, revealed = false, element = null) {
    this.id = id;
    this.value = value;
    this._matched = matched;
    this.revealed = revealed;
    this.element = element;
  }
  reveal() {
    this.revealed = !this.revealed;
    if (this.revealed) {
      this.element.classList.add("revealed");
    } else {
      this.element.classList.remove("revealed");
    }
  }
  set matched(value) {
    this._matched = value;
    if (value) {
      this.element.classList.add("matched");
    } else {
      this.element.classList.remove("matched");
    }
  }
  get matched() {
    return this._matched;
  }
}

class Board {
  numSounds = {
    correct: 2,
    wrong: 4,
    lose: 2,
    win: 3,
  };

  constructor() {
    this.disabled = false;
    this.lastRevealedTile = null;
    this.tiles = [];
    this.mistakes = 0;
    this.matchedTiles = 0;
    this.matchedToWin = NUM_TILES / 2;
    this.youWin = false;
    this.youWinElement = document.getElementById("you-win");
    this.boardElement = document.getElementById("board");

    preloadSounds(this._getAllSounds());
  }

  _createImageUrl(key) {
    return `${BASE_ASSET_URL}/images/donkey_${key}.png`;
  }

  _getAllSounds() {
    return Object
      .entries(this.numSounds)
      .map(([key, value]) =>
        new Array(value).fill().map((_, index) => `/${key}_${index+1}.ogg`)
      ).flat();
  }

  createTiles() {
    for (let i = 0; i < NUM_TILES / 2; i++) {
      const imageUrl = this._createImageUrl(i + 1);
      this.tiles.push(new Tile(i, imageUrl));
      this.tiles.push(new Tile(i + NUM_TILES / 2, imageUrl));
    }
    this.shuffleTiles();
  }

  shuffleTiles() {
    let currentIndex = this.tiles.length;

    while (currentIndex !== 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      const temp = this.tiles[currentIndex];
      this.tiles[currentIndex] = this.tiles[randomIndex];
      this.tiles[randomIndex] = temp;
    }
  }

  drawMistakes() {
    const mistakesElement = document.getElementById("mistakes");
    mistakesElement.textContent = `Mistakes: ${this.mistakes}`;
  }

  onCardClick(tile) {
    if (this.disabled) {
      return;
    }
    if (tile.matched) {
      return;
    }
    if (this.lastRevealedTile === null) {
      this.lastRevealedTile = tile;
      tile.reveal();
    } else {
      if (this.lastRevealedTile.id === tile.id) {
        return;
      }
      tile.reveal();
      if (this.lastRevealedTile.value === tile.value) {
        this.lastRevealedTile.matched = true;
        tile.matched = true;
        this.lastRevealedTile = null;
        this.matchedTiles += 1;
        if (this.matchedTiles === this.matchedToWin) {
          playSound(["win_1.ogg", "win_2.ogg", "win_3.ogg"]);
          this.youWin = true;
        
          this.youWinElement.classList.remove("hidden");
        } else {
          playSound(["correct_1.ogg", "correct_2.ogg"]);
        }
      } else {
        this.mistakes += 1;
        this.drawMistakes();
        this.disabled = true;
        playSound(["wrong_1.ogg", "wrong_2.ogg", "wrong_3.ogg", "wrong_4.ogg"]);
        setTimeout(() => {
          this.lastRevealedTile.reveal();
          tile.reveal();
          this.lastRevealedTile = null;
          this.disabled = false;
        }, 650);
      }
    }
  }

  draw() {
    if (this.tiles.length === 0) {
      this.createTiles();
    }

    this.boardElement.innerHTML = "";

    this.tiles.forEach((tile) => {
      const tileElement = document.createElement("div");
      tileElement.classList.add("tile");
      tileElement.id = tile.id;
      tile.element = tileElement;
      tileElement.addEventListener("click", () => {
        this.onCardClick(tile);
      });
      tileElement.style.setProperty("--tile-image", `url(${tile.value})`);
      this.boardElement.appendChild(tileElement);
    });
  }

  reset() {
    this.tiles = [];
    this.createTiles();
    this.disabled = false;
    this.lastRevealedTile = null;
    this.youWin = false;
    this.mistakes = 0;
    this.matchedToWin = NUM_TILES / 2;
    this.matchedTiles = 0;
    this.youWinElement.classList.add("hidden");

    this.draw();
    this.drawMistakes();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const board = new Board();
  board.draw();
  board.drawMistakes();

  const restartButton = document.getElementById("restart");
  restartButton.addEventListener("click", () => {
    board.reset();
  });
});
