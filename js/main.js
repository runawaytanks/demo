//////////////
// PLAYER 1 //
//////////////
const player1_canvas = new Canvas("player1_canvas");
const player1_status = document.getElementById("player1_status");
const player1 = new Client(player1_canvas, player1_status);

const player1_prediction_input = document.getElementById("player1_prediction");
player1_prediction_input.checked = player1.client_prediction;

player1_prediction_input.addEventListener("change", (event) => {
    player1.setClientPrediction(player1_prediction_input.checked);
    player1_reconciliation_input.checked = player1.server_reconciliation;
});

const player1_reconciliation_input = document.getElementById("player1_reconciliation");
player1_reconciliation_input.addEventListener("change", (event) => {
    player1.setServerReconciliation(player1_reconciliation_input.checked);
    player1_prediction_input.checked = player1.client_prediction;
});

const player1_interpolation_input = document.getElementById("player1_interpolation");
player1_interpolation_input.addEventListener("change", (event) => {
    player1.setEntityInterpolation(player1_interpolation_input.checked);
});

//////////////
// PLAYER 2 //
//////////////
const player2_canvas = new Canvas("player2_canvas");
const player2_status = document.getElementById("player2_status");
const player2 = new Client(player2_canvas, player2_status);

const player2_prediction_input = document.getElementById("player2_prediction");
player2_prediction_input.checked = player2.client_prediction;

player2_prediction_input.addEventListener("change", (event) => {
    player2.setClientPrediction(player2_prediction_input.checked);
    player2_reconciliation_input.checked = player2.server_reconciliation;
});

const player2_reconciliation_input = document.getElementById("player2_reconciliation");
player2_reconciliation_input.addEventListener("change", (event) => {
    player2.setServerReconciliation(player2_reconciliation_input.checked);
    player2_prediction_input.checked = player2.client_prediction;
});

const player2_interpolation_input = document.getElementById("player2_interpolation");
player2_interpolation_input.addEventListener("change", (event) => {
    player2.setEntityInterpolation(player2_interpolation_input.checked);
});

////////////
// SERVER //
////////////
const server_canvas = new Canvas("server_canvas");
const server_status = document.getElementById("server_status");
const server = new Server(server_canvas, server_status);

const world_update_interval_input = document.getElementById("world_update_interval");
world_update_interval_input.value = server.world_update_interval;
world_update_interval_input.addEventListener("change", (event) => {
    server.setWorldUpdateInterval(parseInt(world_update_interval_input.value));
});

const client_simulation_offset_input = document.getElementById("client_simulation_offset");
client_simulation_offset_input.value = server.client_simulation_offset;
client_simulation_offset_input.addEventListener("change", (event) => {
    server.client_simulation_offset = parseInt(client_simulation_offset_input.value);
});

const entity_interpolation_delay_input = document.getElementById("entity_interpolation_delay");
entity_interpolation_delay_input.value = server.entity_interpolation_delay;
entity_interpolation_delay_input.addEventListener("change", (event) => {
    server.entity_interpolation_delay = parseInt(entity_interpolation_delay_input.value);
});

/////////////
// NETWORK //
/////////////
const player1_network = new Network(400);
player1.connectToServer(player1_network);
server.connectToClient(player1_network);

const player1_network_rtt_input = document.getElementById("player1_network_rtt");
player1_network_rtt_input.value = player1_network.rtt;
player1_network_rtt_input.addEventListener("change", (event) => {
    player1_network.rtt = parseInt(player1_network_rtt_input.value);
});

const player1_network_rtt_increase_input = document.getElementById("player1_network_rtt_increase");
player1_network_rtt_increase_input.value = player1_network.rtt_increase;
player1_network_rtt_increase_input.addEventListener("change", (event) => {
    player1_network.rtt_increase = parseInt(player1_network_rtt_increase_input.value);
});

const player2_network = new Network(400);
player2.connectToServer(player2_network);
server.connectToClient(player2_network);

const player2_network_rtt_input = document.getElementById("player2_network_rtt");
player2_network_rtt_input.value = player2_network.rtt;
player2_network_rtt_input.addEventListener("change", (event) => {
    player2_network.rtt = parseInt(player2_network_rtt_input.value);
});

const player2_network_rtt_increase_input = document.getElementById("player2_network_rtt_increase");
player2_network_rtt_increase_input.value = player2_network.rtt_increase;
player2_network_rtt_increase_input.addEventListener("change", (event) => {
    player2_network.rtt_increase = parseInt(player2_network_rtt_increase_input.value);
});

///////////
// INPUT //
///////////
const keyMap = {
    ArrowUp: { player: player1, direction: 'UP' },
    ArrowLeft: { player: player1, direction: 'LEFT' },
    ArrowDown: { player: player1, direction: 'DOWN' },
    ArrowRight: { player: player1, direction: 'RIGHT' },
    w: { player: player2, direction: 'UP' },
    a: { player: player2, direction: 'LEFT' },
    s: { player: player2, direction: 'DOWN' },
    d: { player: player2, direction: 'RIGHT' }
};

document.addEventListener('keydown', (event) => handleKey(event, true));
document.addEventListener('keyup', (event) => handleKey(event, false));

function handleKey(event, isKeyDown) {
    if (['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
    }

    const mapping = keyMap[event.key];
    if (mapping) {
        const { player, direction } = mapping;
        player.input_key = isKeyDown ? direction : null;
    }
}
