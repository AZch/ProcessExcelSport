const Excel = require('exceljs');
const Country = require('./country');
const Edge = require('./edge');
const DataGame = require('./dataGame');

const inputFile = "./shedule.xlsx";
const outputFile = './tables.xlsx';
const outputFileFuture = './future.xlsx';
const resultRowStart = 2;

async function ReadXLSX(fileName) {
    let workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(fileName);
    return workbook;
}

function isInvalideCells(cells) {
    return cells === undefined ||
        cells === null ||
        cells._value.model.value === undefined ||
        cells._value.model.value.trim() === ""
    
}

function MakeDataFromFile(workbook, workParams=makeWorkParams()) {
    let countrys = [];
    let futureEdgesCountrys = new Map();
    for (let worksheet of workbook.worksheets) {
        let country = new Country(worksheet.name);
        let futureEdges = [];
        for (let row = workParams.indexStartReadRow.row; row < worksheet._rows.length; row++) {
            if (isInvalideCells(worksheet._rows[row]._cells[workParams.indexColumnAway.column]) ||
                isInvalideCells(worksheet._rows[row]._cells[workParams.indexColumnHome.column])) {
                break;
            }
            let data = new DataGame();
            let dateGame = worksheet._rows[row]._cells[workParams.indexColumnDate.column]._value.model.value;
            let teamHome = country.getTeamByName(worksheet._rows[row]._cells[workParams.indexColumnHome.column]._value.model.value);
            let teamAway = country.getTeamByName(worksheet._rows[row]._cells[workParams.indexColumnAway.column]._value.model.value);
            for (let column = workParams.readRowIndex.start.column; column < workParams.readRowIndex.end.column; column++) {
                if (worksheet._rows[row]._cells[column] !== undefined &&
                    !data.addData(worksheet._rows[row]._cells[column]._value.model.value)) {
                    break;
                }
            }
            if (data.isValid()) {
                const edge = new Edge(teamHome, teamAway, dateGame, data);
                teamHome.addEdgeHome(edge);
                teamAway.addEdgeAway(edge);
            } else {
                const edge = new Edge(teamHome, teamAway, dateGame, undefined);
                futureEdges.push(edge);
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

        calcFutureEdges(futureEdges);
        futureEdgesCountrys.set(country.countryName, futureEdges);

        countrys.push(country);
    }
    return { countrys, futureEdgesCountrys };
}

function calcFutureEdges(edges) {
    // P = (L + O) / 2 = ((F * O) + (R * B)) / 2
    // Q = (M + N) / 2 = ((G * N) + (S * C)) / 2
    // 100 - P - Q
    // AE = (AA + AD) / 2 = ((H * Q) + (U * D)) / 2
    // AF = (AB + AC) / 2 = ((I * P) + (T * E)) / 2
    // AG = AE + AF
    edges.forEach((edge) => {
        if (edge.futureData !== undefined) {
            const teamHome = edge.home.team;
            const teamAway = edge.away.team;
            edge.futureData.chance.home = (
                (teamHome.edgesHome.data.MKaverage.home * teamAway.resultCalcParams.away.RatingDefend) +
                (teamAway.edgesAway.data.MKaverage.home * teamHome.resultCalcParams.home.RatingAttack)) / 2;

            edge.futureData.chance.away = (
                (teamHome.edgesHome.data.MKaverage.away * teamAway.resultCalcParams.away.RatingAttack) +
                (teamAway.edgesAway.data.MKaverage.away * teamHome.resultCalcParams.home.RatingDefend)
            ) / 2;
            edge.futureData.chance.x = 100 - edge.futureData.chance.home - edge.futureData.chance.away;

            edge.futureData.xG.home = (
                (teamHome.edgesHome.data.calc.xGaverage * teamAway.resultCalcParams.away.RatingxGOther) +
                (teamAway.edgesAway.data.calc.xGAaverage * teamHome.resultCalcParams.home.RatingxG)
            ) / 2;
            edge.futureData.xG.away = (
                (teamHome.edgesHome.data.calc.xGAaverage * teamAway.resultCalcParams.away.RatingxG) +
                (teamAway.edgesAway.data.calc.xGaverage * teamHome.resultCalcParams.home.RatingxGOther)
            ) / 2;
            edge.futureData.total = edge.futureData.xG.home + edge.futureData.xG.away;
        }
    });

}

function makeWorkParams() {
    return {
        indexStartReadRow: templateIndexOneRead(null, 3), // start read excel
        indexColumnDate: templateIndexOneRead(0), // date home away
        indexColumnHome: templateIndexOneRead(1), // team home name
        indexColumnAway: templateIndexOneRead(2), // team away name
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
        team.resultCalcParams[command].RatingAttack,  widthColumn, // B N
        '7CC6FE');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team.resultCalcParams[command].RatingDefend, widthColumn, // C O
        'FEAEAE');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team.resultCalcParams[command].RatingxG, widthColumn, // D P
        '92D050');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team.resultCalcParams[command].RatingxGOther, widthColumn, // E Q
        'B888DA');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team[edges].data.MKaverage.home, widthColumn, // F R
        'D8D8D8', '0070C0');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team[edges].data.MKaverage.away, widthColumn, // G S
        'D8D8D8', 'FF0000');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team[edges].data.calc.xGaverage, widthColumn, // H T
        'FFFFFF', '00B050');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team[edges].data.calc.xGAaverage, widthColumn, // I U
        'FFFFFF', '7030A0');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team[edges].data.calc.Gby_xG, widthColumn, // J V
        'B0C0CE', '000000');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strIndex,
        team[edges].data.calc.fortune, widthColumn, // K W
        'B0C0CE', team[edges].data.calc.fortune > 0 ? '000000' : 'FF0000');
    return getNextExcelLetter(column);
}

function fillCurrentCountrys(workbook, countrys) {
    const startTime = new Date().getTime();
    for (let country of countrys) {
        let sheet = workbook.addWorksheet(country.countryName);
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
}

function fillHeaderFuture(sheet, teamWidth, numWidth) {
    let column = 'A';
    const strRow = "1";
    fillCellWithColor(sheet, column, strRow, "Date", numWidth);

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strRow, "Team home", teamWidth);

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strRow, "Team away", teamWidth);

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strRow, "ChncH", numWidth,
        'FFFFFF', '5275C1');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strRow, "ChncA", numWidth,
        'FFFFFF', 'FF0000');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strRow, "ChncX", numWidth,
        'FFFFFF','08BC96');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strRow, "xGH", numWidth,
        'FFFFFF','5275C1');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strRow, "xGA", numWidth,
        'FFFFFF', 'FF0000');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strRow, "Total", numWidth,
        '92D050');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strRow,
        "G/xGH", numWidth,
        'B0C0CE', '000000');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strRow,
        "G/xGA", numWidth,
        'B0C0CE', '000000');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strRow,
        "fort_h", numWidth,
        'B0C0CE', '000000');

    column = getNextExcelLetter(column);
    fillCellWithColor(sheet, column, strRow,
        "fort_h", numWidth,
        'B0C0CE', '000000');
}

function dateToFormatString(date) {
    return isString(date) || date === undefined ? date : date.getMonth() + "." + date.getDay() + "." + date.getFullYear();
}

function fillFutureEdges(workbook, futureEdges) {
    const teamWidth = 12, numWidth = 7;
    for (let edgesCountry of futureEdges) {
        let sheet = workbook.addWorksheet(edgesCountry[0]);
        let row = 2;
        fillHeaderFuture(sheet, teamWidth, numWidth);
        edgesCountry[1].forEach((edge) => {
            let column = 'A';
            const strRow = row.toString();
            fillCellWithColor(sheet, column, strRow, isString(edge.dateGame) ? edge.dateGame : dateToFormatString(edge.dateGame), numWidth);

            column = getNextExcelLetter(column);
            fillCellWithColor(sheet, column, strRow, edge.home.team.name, teamWidth);

            column = getNextExcelLetter(column);
            fillCellWithColor(sheet, column, strRow, edge.away.team.name, teamWidth);

            column = getNextExcelLetter(column);
            fillCellWithColor(sheet, column, strRow, edge.futureData.chance.home, numWidth,
                'FFFFFF', '5275C1');

            column = getNextExcelLetter(column);
            fillCellWithColor(sheet, column, strRow, edge.futureData.chance.away, numWidth,
                'FFFFFF', 'FF0000');

            column = getNextExcelLetter(column);
            fillCellWithColor(sheet, column, strRow, edge.futureData.chance.x, numWidth,
                'FFFFFF','08BC96');

            column = getNextExcelLetter(column);
            fillCellWithColor(sheet, column, strRow, edge.futureData.xG.home, numWidth,
                'FFFFFF','5275C1');

            column = getNextExcelLetter(column);
            fillCellWithColor(sheet, column, strRow, edge.futureData.xG.away, numWidth,
                'FFFFFF', 'FF0000');

            column = getNextExcelLetter(column);
            fillCellWithColor(sheet, column, strRow, edge.futureData.total, numWidth,
                '92D050');

            column = getNextExcelLetter(column);
            fillCellWithColor(sheet, column, strRow,
                edge.home.team.edgesHome.data.calc.Gby_xG, numWidth,
                'B0C0CE', '000000');

            column = getNextExcelLetter(column);
            fillCellWithColor(sheet, column, strRow,
                edge.away.team.edgesAway.data.calc.Gby_xG, numWidth,
                'B0C0CE', '000000');

            column = getNextExcelLetter(column);
            fillCellWithColor(sheet, column, strRow,
                edge.home.team.edgesHome.data.calc.fortune, numWidth,
                'B0C0CE', edge.home.team.edgesHome.data.calc.fortune > 0 ? '000000' : 'FF0000');

            column = getNextExcelLetter(column);
            fillCellWithColor(sheet, column, strRow,
                edge.away.team.edgesAway.data.calc.fortune, numWidth,
                'B0C0CE', edge.away.team.edgesAway.data.calc.fortune > 0 ? '000000' : 'FF0000');
            row++;
        });

    }
}

ReadXLSX(inputFile).then((workbook) => {
    const { countrys, futureEdgesCountrys } = MakeDataFromFile(workbook);
    let workbookTable = new Excel.Workbook();
    fillCurrentCountrys(workbookTable, countrys);
    workbookTable.xlsx.writeFile(outputFile);

    let workbookFuture = new Excel.Workbook();
    fillFutureEdges(workbookFuture, futureEdgesCountrys);
    workbookFuture.xlsx.writeFile(outputFileFuture);
});

