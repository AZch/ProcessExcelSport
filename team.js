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
        this.calcParams = {
            home: this.templateCalcParams(),
            away: this.templateCalcParams()
        };
        this.resultCalcParams = {
            home: this.templateCalcParams(),
            away: this.templateCalcParams()
        };
    }

    calcAvarengeParams(edges,command) {
        let result = this.templateCalcParams();
        edges.forEach((edge) => {
            result.RatingAttack += edge[command].team.calcParams[command].RatingAttack;
            result.RatingDefend += edge[command].team.calcParams[command].RatingDefend;
            result.RatingxG += edge[command].team.calcParams[command].RatingxG;
            result.RatingxGOther += edge[command].team.calcParams[command].RatingxGOther;
        });
        result.RatingAttack /= edges.length;
        result.RatingDefend /= edges.length;
        result.RatingxG /= edges.length;
        result.RatingxGOther /= edges.length;
        return result;
    }

    templateCalcParams() {
        return {
            RatingAttack: 0.0,
            RatingDefend: 0.0,
            RatingxG: 0.0,
            RatingxGOther: 0.0,
        }
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

    makeAvangersAfterCount(edges, isHome) {
        edges.data.Saverage.home /= edges.edges.length;
        edges.data.Saverage.away /= edges.edges.length;
        edges.data.MKaverage.home /= edges.edges.length;
        edges.data.MKaverage.away /= edges.edges.length;

        isHome ? this.calcTable(edges, 'home', 'away') : this.calcTable(edges, 'away', 'home');
    }

    calcTable(edges, commandThis, commandEnemy) {
        let count = edges.edges.length;
        let goals = edges.data.goals;
        let xG = edges.data.xGSum;
        let points = edges.data.points;
        let xPoints = edges.data.xPoints;
        edges.data.calc.xPaverage = edges.data.xPoints / count;
        edges.data.calc.dG = ((goals[commandThis] - goals[commandEnemy]) - (xG[commandThis] - xG[commandEnemy])) / count;
        edges.data.calc.xGaverage = xG[commandThis] / count;
        edges.data.calc.xGAaverage = xG[commandEnemy] / count;
        edges.data.calc.xgAvSum = edges.data.calc.xGav + edges.data.calc.xGAav;
        edges.data.calc.Gby_xG = (goals[commandThis] + goals[commandEnemy]) / (xG[commandThis] + xG[commandEnemy]);
        edges.data.calc.fortune = (points - xPoints) / count;
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
        oldEdgeData.goals.home += newEdge.baseData.data.home;
        oldEdgeData.goals.away += newEdge.baseData.data.away;

        oldEdgeData.xGSum.home += newEdge.baseData.data.xG.home;
        oldEdgeData.xGSum.away += newEdge.baseData.data.xG.away;

        oldEdgeData.Saverage.home += newEdge.baseData.data.S.home;
        oldEdgeData.Saverage.away += newEdge.baseData.data.S.away;

        oldEdgeData.MKaverage.home += newEdge.baseData.data.MK.home;
        oldEdgeData.MKaverage.away += newEdge.baseData.data.MK.away;

        oldEdgeData.xPoints += isHome ? newEdge.baseData.data.xP.home : newEdge.baseData.data.xP.away;
        return oldEdgeData;
    }

    templateDataTeam() {
        return {
            win: 0,
            x: 0,
            lose: 0,
            points: 0,
            xPoints: 0,
            goals: {
                home: 0,
                away: 0,
            },
            xGSum: {
                home: 0,
                away: 0
            },
            Saverage: {
                home: 0,
                away: 0
            },
            MKaverage: {
                home: 0,
                x: 0,
                away: 0,
                under: 0,
                over: 0
            },
            calc: {
                xPaverage: undefined,
                dG: undefined,
                xGaverage: undefined,
                xGAaverage: undefined,
                xgAvSum: undefined,
                Gby_xG: undefined,
                fortune: undefined
            }

        }
    }
};