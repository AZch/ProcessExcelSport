const Team = require('./team');

module.exports = class Edge {
  constructor(homeTeam, awayTeam, data) {
      //if (homeTeam instanceof Team &&
      //      awayTeam instanceof  Team &&
      //      this.validateGameData(data)) {
      this.home = this.dataTeamFromTemplate(homeTeam, data);
      this.away = this.dataTeamFromTemplate(awayTeam, data);
      this.baseData = data;

      //}
  }

  dataTeamFromTemplate(team, data) {
      return {
          team: team,
          data: this.calcDataTeam(team, data)
      };
  }

  calcDataTeam(team, data) {

  }

  validateGameData(data) {
      return true;
  }
};