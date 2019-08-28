const Team = require('./team');

module.exports = class Country {
  constructor(countryName) {
      this.countryName = countryName;
      this.teams = new Map();
      this.data = {
          home: this.templateAllData(),
          away: this.templateAllData()
      }
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
      if (this.teams.get(name) === undefined) {
          this.teams.set(name, new Team(name));
      }
      return this.teams.get(name);
  }

  calcAv() {

  }

  templateAllData() {
       return {
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
               away: 0
           },
           xGav: {
               home: 0,
               away: 0
           }
       };
  }
};