class TankState {
    constructor({ x, y, direction, color }) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.color = color;
    }
}

class Tank {
    constructor(id, state) {
        this.id = id;
        this.state = state;
        this.width = SPRITE_SIZE;
        this.height = SPRITE_SIZE;
        this.speed = 100;
    }

    getState() {
        return new TankState({
            x: this.state.x,
            y: this.state.y,
            direction: this.state.direction,
            color: this.state.color,
        });
    }

    setState(state) {
        this.state = new TankState({
            x: state.x,
            y: state.y,
            direction: state.direction,
            color: state.color,
        });
    }

    interpolateState(first_state, second_state, interpolation_factor) {
        this.state = new TankState({
            x: first_state.x + (second_state.x - first_state.x) * interpolation_factor,
            y: first_state.y + (second_state.y - first_state.y) * interpolation_factor,
            direction: second_state.direction,
            color: second_state.color,
        });
    }

    applyInput(input) {
        if (!input) return;
        this.state.direction = input.key;
        const distance = (SIMULATION_STEP / ONE_SECOND) * this.speed;

        switch (input.key) {
            case "UP":
                this.state.y = Math.max(0, this.state.y - distance);
                break;
            case "LEFT":
                this.state.x = Math.max(0, this.state.x - distance);
                break;
            case "DOWN":
                this.state.y = Math.min(CANVAS_HEIGHT - this.height, this.state.y + distance);
                break;
            case "RIGHT":
                this.state.x = Math.min(CANVAS_WIDTH - this.width, this.state.x + distance);
                break;
        }
    }

    isCollidingWithEntity(entity) {
        return Math.abs(this.state.x - entity.state.x) < this.width && Math.abs(this.state.y - entity.state.y) < this.height;
    }
}
