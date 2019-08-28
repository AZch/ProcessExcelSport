const Edge = require('./edge');

module.exports = class Team {
    constructor(name) {
        this.name = name;
        this.edgesHome = {
            edges: [],
            data: this.templateDataTeam()
        };
        this.edgesAway = {
            edges: [],
            data: this.templateDataTeam()
        };
    }

    addEdgeHome(edge) {
        if (edge instanceof Edge) {
            this.edgesHome.edges.push(edge);
            this.edgesHome.data = this.updateEdgeData(edge, this.edgesHome.data, true);
            return true;
        }
        return false;
    }

    addEdgeAway(edge) {
        if (edge instanceof Edge) {
            this.edgesAway.edges.push(edge);
            this.edgesAway.data = this.updateEdgeData(edge, this.edgesAway.data, false);
            return true;
        }
        return false;
    }

    makeAvangersAfterCount(edges) {
        edges.data.Sav.home /= edges.edges.length;
        edges.data.Sav.away /= edges.edges.length;
        edges.data.MKav.home /= edges.edges.length;
        edges.data.MKav.away /= edges.edges.length;
    }

    updateEdgeData(newEdge, oldEdgeData, isHome) {
        if (isHome ? newEdge.baseData.data.home > newEdge.baseData.data.away : newEdge.baseData.data.home < newEdge.baseData.data.away ) {
            oldEdgeData.win++;
            oldEdgeData.points += 3;
        } else if (isHome ? newEdge.baseData.data.home < newEdge.baseData.data.away : newEdge.baseData.data.home > newEdge.baseData.data.away) {
            oldEdgeData.lose++;
        } else {
            oldEdgeData.x++;
            oldEdgeData.points += 1;
        }
        oldEdgeData.goalsHome += newEdge.baseData.data.home;
        oldEdgeData.goalsAway += newEdge.baseData.data.away;

        oldEdgeData.xGSum.home += newEdge.baseData.data.xG.home;
        oldEdgeData.xGSum.away += newEdge.baseData.data.xG.away;

        oldEdgeData.Sav.home += newEdge.baseData.data.S.home;
        oldEdgeData.Sav.away += newEdge.baseData.data.S.away;

        oldEdgeData.MKav.home += newEdge.baseData.data.MK.home;
        oldEdgeData.MKav.away += newEdge.baseData.data.MK.away;
        return oldEdgeData;
    }

    templateDataTeam() {
        return {
            win: 0,
            x: 0,
            lose: 0,
            points: 0,
            goalsHome: 0,
            goalsAway: 0,
            xGSum: {
                home: 0,
                away: 0
            },
            Sav: {
                home: 0,
                away: 0
            },
            MKav: {
                home: 0,
                x: 0,
                away: 0,
                under: 0,
                over: 0
            }
        }
    }
};