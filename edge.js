const Team = require('./team');

module.exports = class Edge {
  constructor(homeTeam, awayTeam, data) {
      if (homeTeam instanceof Team &&
            awayTeam instanceof  Team &&
            this.validateGameData(data)) {
          this.homeTeam = homeTeam;
          this.awayTeam = awayTeam;
          this.data = data;
      }
  }

  validateGameData(data) {
      return true;
  }
};