module.exports = class DataGame {
    constructor() {
        this.data = templateEdgeData();
        this.addData = this.addData.bind(this);
    }

    addData(data) {
        if (this.data.home === null) {
            this.data.home = parseInt(data);
        } else if (this.data.away === null) {
            this.data.away = parseInt(data);
        } else if (this.data.xG.home === null) {
            this.data.xG.home = data;
        } else if (this.data.xG.away === null) {
            this.data.xG.away = data;
        } else if (this.data.S.home === null) {
            this.data.S.home = data;
        } else if (this.data.S.away === null) {
            this.data.S.away = data;
        } else if (this.data.MK.home === null) {
            this.data.MK.home = data;
        } else if (this.data.MK.x === null) {
            this.data.MK.x = data;
        } else if (this.data.MK.away === null) {
            this.data.MK.away = data;
        } else if (this.data.MK.under === null) {
            this.data.MK.under = data;
        } else if (this.data.MK.over === null) {
            this.data.MK.over = data;
        } else {
            return false;
        }
        return true;
    }

    isValid() {
        return this.data.home !== undefined &&
            this.data.away !== undefined &&
            this.data.xG.home !== undefined &&
            this.data.xG.away !== undefined &&
            this.data.S.home !== undefined &&
            this.data.S.away !== undefined &&
            this.data.MK.home !== undefined &&
            this.data.MK.away !== undefined &&
            this.data.MK.x !== undefined &&
            this.data.MK.under !== undefined &&
            this.data.MK.over !== undefined;
    }
};

function templateEdgeData() {
    return {
        home: null,
        away: null,
        xG: {
            home: null,
            away: null,
        },
        S: {
            home: null,
            away: null,
        },
        MK: {
            home: null,
            away: null,
            x: null,
            under: null,
            over: null,
        }
    }
}