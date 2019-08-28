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
            this.edgesHome.data = this.updateEdgeData(edge, this.edgesHome.data);
            return true;
        }
        return false;
    }

    addEdgeAway(edge) {
        if (edge instanceof Edge) {
            this.edgesAway.edges.push(edge);
            this.edgesAway.data = this.updateEdgeData(edge, this.edgesAway.data);
            return true;
        }
        return false;
    }

    updateEdgeData(newEdge, oldEdgeData) {
        oldEdgeData.countGame++;
        if (newEdge.baseData.data.home > newEdge.baseData.data.away) {
            oldEdgeData.win++;
            oldEdgeData.points += 3;
        } else if (newEdge.baseData.data.home < newEdge.baseData.data.away) {
            oldEdgeData.lose++;
            oldEdgeData.points += 1;
        } else {
            oldEdgeData.x++;
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
            countGame: 0,
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