const Team = require('./team');

module.exports = class Edge {
  constructor(homeTeam, awayTeam, dateGame, data) {
      //if (homeTeam instanceof Team &&
      //      awayTeam instanceof  Team &&
      //      this.validateGameData(data)) {
      this.home = this.dataTeamFromTemplate(homeTeam, data);
      this.away = this.dataTeamFromTemplate(awayTeam, data);
      this.dateGame = dateGame;
      if (data !== undefined) {
          data.data.xP.home = data.data.MK.home * 3 / 100 + data.data.MK.x / 100;
          data.data.xP.away = data.data.MK.away * 3 / 100 + data.data.MK.x / 100;
          this.baseData = data;
      } else {
          this.futureData = this.templateFutureGame();
      }

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

  templateFutureGame() {
      return {
          chance: {
              home: 0,
              away: 0,
              x: 0
          },
          xG: {
              home: 0,
              away: 0
          },
          total: 0,
      }
  }
};