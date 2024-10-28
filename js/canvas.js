const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 100;
const SPRITE_SIZE = 32;

const SPRITE_TANK_COLORS = {
    YELLOW: { x: 0, y: 0 },
    GREEN: { x: 0, y: 8 },
};

const SPRITE_TANK_DIRECTIONS = {
    UP: 0,
    LEFT: 2,
    DOWN: 4,
    RIGHT: 6,
};

class Canvas {
    constructor(id) {
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.sprites = new Image();
        this.sprites.src = 'img/sprites.png';
    }

    renderTanks(tanks) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const id in tanks) {
            const state = tanks[id].state;
            const sx = (SPRITE_TANK_COLORS[state.color].x + SPRITE_TANK_DIRECTIONS[state.direction]) * SPRITE_SIZE;
            const sy = SPRITE_TANK_COLORS[state.color].y * SPRITE_SIZE;
            this.ctx.drawImage(this.sprites, sx, sy, SPRITE_SIZE, SPRITE_SIZE, state.x, state.y, SPRITE_SIZE, SPRITE_SIZE);

            this.ctx.strokeStyle = 'RED';
            this.ctx.strokeRect(state.x, state.y, SPRITE_SIZE, SPRITE_SIZE);
        }
    }
}
