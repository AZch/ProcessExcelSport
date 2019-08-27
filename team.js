const Edge = require('./edge');

module.exports = class Team {
    constructor(name) {
        this.name = name;
        this.edgesHome = [];
        this.edgesAway = [];
    }

    addEdgeHome(edge) {
        if (edge instanceof Edge) {
            this.edgesHome.push(edge);
            return true;
        }
        return false;
    }

    addEdgeAway(edge) {
        if (edge instanceof Edge) {
            this.edgesAway.push(edge);
            return true;
        }
        return false;
    }
};