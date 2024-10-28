const ONE_SECOND = 1000;
const SIMULATION_STEP = 10;

const PRECREATED_TANKS = {
    1: new Tank(1, new TankState({ x: 10, y: 10, direction: "RIGHT", color: "YELLOW" })),
    2: new Tank(2, new TankState({ x: 50, y: 50, direction: "LEFT", color: "GREEN" })),
};

class Server {
    constructor(canvas, status) {
        this.client_id = 1;
        this.client_tanks = {};
        this.client_networks = {};
        this.client_input_buffer = {};
        this.client_acknowledged_input = {};
        this.client_previous_tank_state = {};

        this.world_update_interval = null;
        this.world_update_timer = null;
        this.setWorldUpdateInterval(100);

        this.simulation_timestamp = 0;
        this.simulation_accumulator = 0;
        this.simulation_previous_timestamp = Date.now();

        this.client_simulation_offset = 500;
        this.entity_interpolation_delay = 500;

        this.ui_canvas = canvas;
        this.ui_status = status;
    }

    connectToClient(network) {
        network.server = this;
        const id = this.client_id;
        this.client_tanks[id] = PRECREATED_TANKS[id];
        this.client_networks[id] = network;
        this.client_input_buffer[id] = [];
        this.client_acknowledged_input[id] = 0;
        this.client_previous_tank_state[id] = null;
        this.client_id++;
    }

    setWorldUpdateInterval(interval) {
        this.world_update_interval = interval;
        clearInterval(this.world_update_timer);
        this.world_update_timer = setInterval(() => { this.updateWorld(); }, interval);
    }

    setClientSimulationOffset(client_simulation_offset) {
        this.client_simulation_offset = client_simulation_offset;
    }

    setEntityInterpolationDelay(entity_interpolation_delay) {
        this.entity_interpolation_delay = entity_interpolation_delay;
    }

    updateWorld() {
        const now = Date.now();
        this.simulation_accumulator += now - this.simulation_previous_timestamp;
        this.simulation_previous_timestamp = now;

        while (this.simulation_accumulator >= SIMULATION_STEP) {
            this.simulation_timestamp += SIMULATION_STEP;
            this.simulation_accumulator -= SIMULATION_STEP;
            this.simulateClients();
            this.checkCollisions();
        }

        this.broadcastWorldState();
        this.renderTanksOnCanvas();
        this.showStatusOnPage();
    }

    receive(client_input) {
        this.client_input_buffer[client_input.id].push(client_input);
    }

    simulateClients() {
        for (const id in this.client_input_buffer) {
            this.client_previous_tank_state[id] = this.client_tanks[id].getState();

            while (this.client_input_buffer[id].length > 0) {
                const input = this.client_input_buffer[id][0];

                if (input.timestamp < this.simulation_timestamp) {
                    console.log(`server: dropped old input of Player ${id}`);
                    this.client_acknowledged_input[id] = input.timestamp;
                    this.client_input_buffer[id].shift();
                } else if (input.timestamp === this.simulation_timestamp) {
                    this.client_tanks[id].applyInput(input);
                    this.client_acknowledged_input[id] = input.timestamp;
                    this.client_input_buffer[id].shift();
                } else {
                    break;
                }
            }
        }
    }

    checkCollisions() {
        const tankIDs = Object.keys(this.client_tanks);

        for (let i = 0; i < tankIDs.length; i++) {
            const tank1 = this.client_tanks[tankIDs[i]];

            for (let j = i + 1; j < tankIDs.length; j++) {
                const tank2 = this.client_tanks[tankIDs[j]];

                if (tank1.isCollidingWithEntity(tank2)) {
                    console.log(`Collision detected between Tank ${tank1.id} and Tank ${tank2.id}`);
                    tank1.setState(this.client_previous_tank_state[tankIDs[i]]);
                    tank2.setState(this.client_previous_tank_state[tankIDs[j]]);
                }
            }
        }
    }

    broadcastWorldState() {
        const tank_states = {};

        for (const id in this.client_tanks) {
            tank_states[id] = this.client_tanks[id].getState();
        }

        for (const id in this.client_networks) {
            const world_state = {
                client_id: id,
                tank_states: tank_states,
                server_timestamp: this.simulation_timestamp,
                client_simulation_offset: this.client_simulation_offset,
                entity_interpolation_delay: this.entity_interpolation_delay,
                client_acknowledged_input: this.client_acknowledged_input[id],
            };

            this.client_networks[id].serverSend(world_state);
        }
    }

    renderTanksOnCanvas() {
        this.ui_canvas.renderTanks(this.client_tanks);
    }

    showStatusOnPage() {
        let status = "Input Buffer ";

        for (const id in this.client_input_buffer) {
            status += `P${id}: ${this.client_input_buffer[id].length}  `;
        }

        this.ui_status.textContent = status;
    }
}
