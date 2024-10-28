class Network {
    constructor(rtt) {
        this.rtt = rtt;
        this.rtt_increase = 0;
        this.client = null;
        this.server = null;

        setInterval(() => { this.rtt += this.rtt_increase; }, 5000);
    }

    clientSend(message) {
        setTimeout(() => {
            this.server.receive(message);
        }, this.rtt / 2);
    }

    serverSend(message) {
        setTimeout(() => {
            this.client.receive(message);
        }, this.rtt / 2);
    }
}
