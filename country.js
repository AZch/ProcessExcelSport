const Team = require('./team');

module.exports = class Country {
  constructor(countryName) {
      this.startTime = new Date().getTime();
      this.lastTimeWork = new Date().getTime();
      this.countryName = countryName;
      this.teams = new Map();
      this.data = {
          home: this.templateAllData(),
          away: this.templateAllData()
      }
  }

  getTimeWork() {
      return (new Date().getTime - this.startTime);
  }

  getLastTimeWork() {
      return (this.lastTimeWork - this.startTime);
  }

  getLastTimeWorkSecond() {
      return (this.lastTimeWork - this.startTime) / 1000;
  }

  setLastTimeWork() {
      this.lastTimeWork = new Date().getTime();
      return this.getLastTimeWork()
  }

  getTeamByName(name) {
      if (this.teams.get(name) === undefined) {
          this.teams.set(name, new Team(name));
      }
      return this.teams.get(name);
  }

  calcAllEdgeData() {
    this.teams.forEach((team) => {
       this.calcAllEdgeWithParams("home", team.edgesHome);
       this.calcAllEdgeWithParams("away", team.edgesAway);
    });

    this.calcResAvForCommand("Saverage");
    this.calcResAvForCommand("MKaverage");
    this.calcResAvForCommand("xGaverage");
  }

  calcResAvForCommand(paramAv) {
      let countTeam = this.teams.size;
      this.data.home[paramAv].home /= countTeam;
      this.data.home[paramAv].away /= countTeam;

      this.data.away[paramAv].home /= countTeam;
      this.data.away[paramAv].away /= countTeam;
  }

  calcAllEdgeWithParams(command, edges) {
      this.calcOneAllEdgeData(command, edges, "xGSum");
      this.calcOneAllEdgeData(command, edges, "Saverage");
      this.calcOneAllEdgeData(command, edges, "MKaverage");

      this.data[command].xGaverage.home += edges.data.calc.xGaverage;
      this.data[command].xGaverage.away += edges.data.calc.xGAaverage;
  }

  calcOneAllEdgeData(command, edges, param) {
      this.data[command][param].home += edges.data[param].home;
      this.data[command][param].away += edges.data[param].away;
  }

  calcAllTeamData() {
    this.teams.forEach((team) => {
        team.calcParams.home.RatingAttack = team.edgesHome.data.MKaverage.home / this.data.home.MKaverage.home;
        team.calcParams.home.RatingDefend = team.edgesHome.data.MKaverage.away / this.data.home.MKaverage.away;
        team.calcParams.home.RatingxGOther = team.edgesHome.data.calc.xGAaverage / this.data.home.xGaverage.away;
        team.calcParams.home.RatingxG = team.edgesHome.data.calc.xGaverage / this.data.home.xGaverage.home;

        team.calcParams.away.RatingAttack = team.edgesAway.data.MKaverage.away / this.data.away.MKaverage.away;
        team.calcParams.away.RatingDefend = team.edgesAway.data.MKaverage.home / this.data.away.MKaverage.home;
        team.calcParams.away.RatingxGOther = team.edgesAway.data.calc.xGAaverage / this.data.away.xGaverage.away;
        team.calcParams.away.RatingxG = team.edgesAway.data.calc.xGaverage / this.data.away.xGaverage.home;
    });
  }

  calcAllTeamFinalData() {
      this.calcAllTeamFinalDataCommand('home');
      this.calcAllTeamFinalDataCommand('away');
  }

  calcAllTeamFinalDataCommand(command) {
      this.teams.forEach((team) => {
          const edges = (command === 'home' ? team.edgesHome.edges : team.edgesAway.edges);
          const otherTeam = (command === 'home' ? 'away' : 'home');
          const averagePrams = team.calcAvarengeParams(edges, otherTeam);
          team.resultCalcParams[command].RatingAttack = team.calcParams[command].RatingAttack / averagePrams.RatingDefend;
          team.resultCalcParams[command].RatingDefend = team.calcParams[command].RatingDefend / averagePrams.RatingAttack;
          team.resultCalcParams[command].RatingxG = team.calcParams[command].RatingxG / averagePrams.RatingxGOther;
          team.resultCalcParams[command].RatingxGOther = team.calcParams[command].RatingxGOther / averagePrams.RatingxG;
      });
  }

  templateAllData() {
       return {
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
               away: 0
           },
           xGaverage: {
               home: 0,
               away: 0
           }
       };
  }
};