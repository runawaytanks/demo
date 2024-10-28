class Client {
    constructor(canvas, status) {
        this.id = null;
        this.tanks = {};
        this.world_states = [];

        this.input_key = null;
        this.input_unacknowledged = [];

        this.network = null;

        this.client_prediction = false;
        this.server_reconciliation = false;
        this.entity_interpolation = false;

        this.ui_canvas = canvas;
        this.ui_status = status;

        this.previous_server_timestamp = 0;
        this.previous_receive_timestamp = 0;

        this.simulation_timestamp = 0;
        this.simulation_accumulator = 0;
        this.simulation_previous_timestamp = Date.now();

        this.client_simulation_offset = 0;
        this.entity_interpolation_delay = 0;

        this.gameLoop();
    }

    connectToServer(network) {
        network.client = this;
        this.network = network;
    }

    setClientPrediction(state) {
        this.client_prediction = state;
        if (!this.client_prediction) {
            this.server_reconciliation = false;
        }
    }

    setServerReconciliation(state) {
        this.server_reconciliation = state;
        if (this.server_reconciliation) {
            this.client_prediction = true;
        }
    }

    setEntityInterpolation(state) {
        this.entity_interpolation = state;
    }

    gameLoop() {
        this.simulateClient();
        this.doServerReconciliation();
        this.doEntityInterpolation();
        this.renderTanksOnCanvas();
        this.showStatusOnPage();
        requestAnimationFrame(() => this.gameLoop());
    }

    simulateClient() {
        if (!this.simulation_timestamp) return;

        const now = Date.now();
        this.simulation_accumulator += now - this.simulation_previous_timestamp;
        this.simulation_previous_timestamp = now;

        while (this.simulation_accumulator >= SIMULATION_STEP) {
            this.simulation_timestamp += SIMULATION_STEP;
            this.simulation_accumulator -= SIMULATION_STEP;
            const input = this.processClientInput();
            this.doClientPrediction(input);
        }
    }

    processClientInput() {
        if (!this.input_key) return null;
        const input = { id: this.id, key: this.input_key, timestamp: this.simulation_timestamp };
        this.network.clientSend(input);
        this.input_unacknowledged.push(input);
        return input;
    }

    doClientPrediction(input) {
        if (this.client_prediction) {
            this.tanks[this.id].applyInput(input);
        } else {
            const latest_state = this.world_states[this.world_states.length - 1].tank_states[this.id];
            this.tanks[this.id].setState(latest_state);
        }
    }

    doServerReconciliation() {
        if (!this.server_reconciliation) return;
        const latest_state = this.world_states[this.world_states.length - 1].tank_states[this.id];
        this.tanks[this.id].setState(latest_state);
        this.input_unacknowledged.forEach(input => {
            this.tanks[this.id].applyInput(input);
        });
    }

    doEntityInterpolation() {
        const interpolation_timestamp = this.simulation_timestamp - this.client_simulation_offset - this.entity_interpolation_delay;

        while (this.world_states.length >= 2) {
            if (this.world_states[1].server_timestamp <= interpolation_timestamp) {
                this.world_states.shift();
            } else {
                break;
            }
        }

        if (this.world_states.length < 2) return;

        const first_world_state = this.world_states[0];
        const second_world_state = this.world_states[1];
        let interpolation_factor = (interpolation_timestamp - first_world_state.server_timestamp) / (second_world_state.server_timestamp - first_world_state.server_timestamp);
        interpolation_factor = Math.max(0, Math.min(1, interpolation_factor));

        for (const id in this.tanks) {
            if (id === this.id) continue;

            if (this.entity_interpolation) {
                const first_state = first_world_state.tank_states[id];
                const second_state = second_world_state.tank_states[id];
                this.tanks[id].interpolateState(first_state, second_state, interpolation_factor);
            } else {
                const latest_state = this.world_states[this.world_states.length - 1].tank_states[id];
                this.tanks[id].setState(latest_state);
            }
        }
    }

    receive(world_state) {
        const now = Date.now();

        if (!this.simulation_timestamp) {
            this.simulation_timestamp = world_state.server_timestamp + world_state.client_simulation_offset;
        }

        if (this.previous_server_timestamp) {
            const server_timedelta = world_state.server_timestamp - this.previous_server_timestamp;
            const receive_timedelta = now - this.previous_receive_timestamp;
            const network_delay = receive_timedelta - server_timedelta;
            this.simulation_accumulator -= network_delay;
        }

        this.previous_server_timestamp = world_state.server_timestamp;
        this.previous_receive_timestamp = now;

        this.id = world_state.client_id;
        this.client_simulation_offset = world_state.client_simulation_offset;
        this.entity_interpolation_delay = world_state.entity_interpolation_delay;
        this.updateAcknowledgedInput(world_state.client_acknowledged_input);

        for (const id in world_state.tank_states) {
            if (!this.tanks[id]) {
                this.tanks[id] = new Tank(id, world_state.tank_states[id]);
            }
        }

        this.world_states.push(world_state);
    }

    updateAcknowledgedInput(acknowledged_input_timestamp) {
        this.input_unacknowledged = this.input_unacknowledged.filter(input => input.timestamp > acknowledged_input_timestamp);
    }

    renderTanksOnCanvas() {
        this.ui_canvas.renderTanks(this.tanks);
    }

    showStatusOnPage() {
        this.ui_status.textContent = `Unacknowledged Input: ${this.input_unacknowledged.length}`
    }
}
