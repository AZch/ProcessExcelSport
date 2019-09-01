const Excel = require('exceljs');
const Country = require('./country');
const Edge = require('./edge');
const DataGame = require('./dataGame');

const inputFile = "shedule.xlsx";
const outputFile = 'tables.xlsx';

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

        country.teams.forEach((team) => {
            team.makeAvangersAfterCount(team.edgesHome, true);
            team.makeAvangersAfterCount(team.edgesAway, false);
        });
        country.calcAllEdgeData();
        country.calcAllTeamData();
        country.calcAllTeamFinalData();

        countrys.push(country);
    }
    return countrys;
}

function makeWorkParams() {
    return {
        indexStartReadRow: templateIndexOneRead(null, 3), // start read excel
        indexColumnHome: templateIndexOneRead(1), // team home name
        indexColumnAway: templateIndexOneRead(2), // team home away
        readRowIndex: {
            start: templateIndexOneRead(4),
            end: templateIndexOneRead(15),
        }
    };
}

function templateIndexOneRead(column = null, row = null) {
    return {
        row: row,
        column: column
    }
}

function fillCellWithColor(sheet, column, row, value, fillColor, fontColor = '000000') {
    const roundParam = 100;
    sheet.getColumn(column).width = 7;
    const cell = column + row;
    sheet.getCell(cell).value = Math.round(value * roundParam) / roundParam;
    sheet.getCell(cell).font = {color: { argb: fontColor }};
    sheet.getColumn(column).width = 7;
    sheet.getCell(cell).fill = {
        type: 'pattern',
        pattern:'darkVertical',
        fgColor:{argb: fillColor}
    };
    sheet.getCell(cell).border = {
        top: {style:'thin'},
        left: {style:'thin'},
        bottom: {style:'thin'},
        right: {style:'thin'}
    };
}

function getNextExcelLetter(letter) {
    if (letter === 'Z' && letter.length === 1) {
        return 'AA';
    } else if (letter.length === 1) {
        return String.fromCharCode(letter.charCodeAt(letter.length - 1) + 1);
    } else  {
        const lastLetter = letter[letter.length - 1];
        if (lastLetter === 'Z') {
            return getNextExcelLetter(letter.substring(0, letter.length - 1)) + 'A';
        } else {
            return letter.substring(0, letter.length - 1) + getNextExcelLetter(lastLetter);
        }
    }

}

function fillExcelCommand(sheet, command, column, strIndex, edges, team) {
    sheet.getCell(column + strIndex).value = team.name;
    sheet.getColumn(column).width = 15;
    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team.resultCalcParams[command].RatingAttack,
        '0070C0');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team.resultCalcParams[command].RatingDefend,
        'FF0000' );

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team.resultCalcParams[command].RatingxG,
        '00B050');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team.resultCalcParams[command].RatingxGOther,
        '7030A0');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team[edges].data.MKaverage.home,
        'B0C1CE', '0070C0');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team[edges].data.MKaverage.away,
        'B0C1CE', 'FF0000');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team[edges].data.calc.xGaverage,
        'FFFFFF', '00B050');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team[edges].data.calc.xGAaverage,
        'FFFFFF', '7030A0');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team[edges].data.calc.Gby_xG,
        'B0C1CE', '000000');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team[edges].data.calc.fortune,
        'B0C1CE', team[edges].data.calc.fortune > 0 ? '000000' : 'FF0000');
    return getNextExcelLetter(column);
}

ReadXLSX(inputFile).then((workbook) => {
    const countrys = MakeDataFromFile(workbook);
    let workbookTable = new Excel.Workbook();
    for (let country of countrys) {
        let sheet = workbookTable.addWorksheet(country.countryName);
        let index = 2;
        country.teams.forEach((team) => {
            const strIndex = index.toString();
            const startColumn = 'A';
            const nextColumn = fillExcelCommand(sheet, 'home', startColumn, strIndex, 'edgesHome', team);

            sheet.getCell(nextColumn + strIndex).fill = {
                type: 'pattern',
                pattern:'darkVertical',
                fgColor:{argb: 'FF0000'}
            };
            sheet.getColumn(nextColumn).width = 2;
            fillExcelCommand(sheet, 'away', getNextExcelLetter(nextColumn), strIndex, 'edgesAway', team);

            index++;
        });
    }
    workbookTable.xlsx.writeFile(outputFile);
});

