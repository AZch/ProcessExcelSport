const Team = require('./team');

module.exports = class Country {
  constructor(countryName) {
      this.countryName = countryName;
      this.teams = {};
  }

  addTeam(team) {
      if (team instanceof Team) {
          this.teams.push(team);
          return true;
      }
      return false;
  }

  getTeams() {
      return this.teams;
  }

  getTeamByName(name) {
      if (this.teams[name] === undefined) {
          this.teams[name] = new Team(name);
      }
      return this.teams[name];
  }
};