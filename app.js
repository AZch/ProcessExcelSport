const Excel = require('exceljs');
const Country = require('./country');
const Edge = require('./edge');
const DataGame = require('./dataGame');

const inputFile = "input.xlsx";

async function ReadXLSX(fileName) {
    let workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(fileName);
    return workbook;
}

function MakeDataFromFile(workbook, workParams=makeWorkParams()) {
    let countrys = [];
    for (let worksheet of workbook.worksheets) {
        let country = new Country(worksheet.name);
        for (let row = workParams.indexStartReadRow.row; row < worksheet._rows.length; row++) {
            if (worksheet._rows[row]._cells[workParams.indexColumnHome.column] === undefined) {
                break;
            }
            let data = new DataGame();
            let teamHome = country.getTeamByName(worksheet._rows[row]._cells[workParams.indexColumnHome.column]._value.model.value);
            let teamAway = country.getTeamByName(worksheet._rows[row]._cells[workParams.indexColumnAway.column]._value.model.value);
            for (let column = workParams.readRowIndex.start.column; column < workParams.readRowIndex.end.column; column++) {
                if (!data.addData(worksheet._rows[row]._cells[column]._value.model.value)) {
                    break;
                }
            }
            if (data.isValid()) {
                let edge = new Edge(teamHome, teamAway, data);
                teamHome.addEdgeHome(edge);
                teamAway.addEdgeAway(edge);

            }
        }
        return country;
        countrys.push(country);
    }
    return countrys;
}

function makeWorkParams() {
    return {
        indexStartReadRow: templateIndexOneRead(null, 3), // start read excel
        indexColumnHome: templateIndexOneRead(1), // team home name
        indexColumnAway: templateIndexOneRead(6), // team home away
        readRowIndex: {
            start: templateIndexOneRead(12),
            end: templateIndexOneRead(23),
        }
    };
}

function templateIndexOneRead(column = null, row = null) {
    return {
        row: row,
        column: column
    }
}



ReadXLSX(inputFile).then((workbook) => {
    MakeDataFromFile(workbook);
});

