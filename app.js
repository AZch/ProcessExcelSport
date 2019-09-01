const Excel = require('exceljs');
const Country = require('./country');
const Edge = require('./edge');
const DataGame = require('./dataGame');

const inputFile = "../shedule.xlsx";
const outputFile = '../tables.xlsx';
const resultRowStart = 2;

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
        country.setLastTimeWork();

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

function isString (value) {
    return typeof value === 'string' || value instanceof String;
}

function fillHeader(sheet, command, column, strIndex) {
    const widthColumn = 7;
    sheet.getCell(column + strIndex).value = "Team" + command;
    sheet.getColumn(column).width = 15;
    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        "RA" + command[0], widthColumn,
        '7CC6FE');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        "RD" + command[0], widthColumn,
        'FEAEAE' );

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        "RxG" + command[0], widthColumn,
        '92D050');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        "RxGO" + command[0], widthColumn,
        'B888DA');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        "MKW" + command[0], widthColumn,
        'D8D8D8', '0070C0');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        "MKL" + command[0], widthColumn,
        'D8D8D8', 'FF0000');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        "xG" + command[0], widthColumn,
        'FFFFFF', '00B050');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        "xGA" + command[0], widthColumn,
        'FFFFFF', '7030A0');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        "G/xG" + command[0], widthColumn,
        'B0C0CE', '000000');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        "fort_" + command[0], widthColumn,
        'B0C0CE');
    return getNextExcelLetter(column);
}

function fillCellWithColor(sheet, column, row, value, width = 7, fillColor='FFFFFF', fontColor = '000000') {
    const roundParam = 100;
    const cell = column + row;
    sheet.getCell(cell).value = isString(value) ? value : Math.round(value * roundParam) / roundParam;
    sheet.getCell(cell).font = {color: { argb: fontColor }};
    sheet.getColumn(column).width = 7;
    sheet.getCell(cell).fill = {
        type: 'pattern',
        pattern:'solid',
        fgColor:{argb: fillColor}
    };
    sheet.getCell(cell).border = {
        top: {style:'thin'},
        left: {style:'thin'},
        bottom: {style:'thin'},
        right: {style:'thin'}
    };
    sheet.getColumn(column).width = width;
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
    const widthColumn = 7;
    sheet.getCell(column + strIndex).value = team.name;
    sheet.getColumn(column).width = 15;
    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team.resultCalcParams[command].RatingAttack,  widthColumn,
        '7CC6FE');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team.resultCalcParams[command].RatingDefend, widthColumn,
        'FEAEAE');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team.resultCalcParams[command].RatingxG, widthColumn,
        '92D050');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team.resultCalcParams[command].RatingxGOther, widthColumn,
        'B888DA');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team[edges].data.MKaverage.home, widthColumn,
        'D8D8D8', '0070C0');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team[edges].data.MKaverage.away, widthColumn,
        'D8D8D8', 'FF0000');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team[edges].data.calc.xGaverage, widthColumn,
        'FFFFFF', '00B050');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team[edges].data.calc.xGAaverage, widthColumn,
        'FFFFFF', '7030A0');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team[edges].data.calc.Gby_xG, widthColumn,
        'B0C0CE', '000000');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team[edges].data.calc.fortune, widthColumn,
        'B0C0CE', team[edges].data.calc.fortune > 0 ? '000000' : 'FF0000');
    return getNextExcelLetter(column);
}

ReadXLSX(inputFile).then((workbook) => {
    const countrys = MakeDataFromFile(workbook);
    let workbookTable = new Excel.Workbook();
    const redColumnWidth = 2;
    const startTime = new Date().getTime();
    for (let country of countrys) {
        let sheet = workbookTable.addWorksheet(country.countryName);
        let index = resultRowStart;
        const startColumn = 'A';
        let middleColumn = '';
        fillHeader(sheet, 'home', startColumn, 1);
        country.teams.forEach((team) => {
            const strIndex = index.toString();
            const nextColumn = fillExcelCommand(sheet, 'home', startColumn, strIndex, 'edgesHome', team);

            fillCellWithColor(sheet, nextColumn, strIndex,
                "", 2,
                'FF0000');

            middleColumn = getNextExcelLetter(nextColumn);
            fillExcelCommand(sheet, 'away', middleColumn, strIndex, 'edgesAway', team);

            index++;
        });
        fillHeader(sheet, 'away', middleColumn, 1);
        fillCellWithColor(sheet, 'B', index.toString(),
            "calc:");
        fillCellWithColor(sheet, 'C', index.toString(),
            country.getLastTimeWorkSecond().toString() + " s.");
        index++;
        fillCellWithColor(sheet, 'B', index.toString(),
            "fill:");
        fillCellWithColor(sheet, 'C', index.toString(),
            ((new Date().getTime() - startTime) / 1000).toString() + " s.");


    }
    workbookTable.xlsx.writeFile(outputFile);
});

