const Excel = require('exceljs');
const Country = require('./country');

const inputFile = "input.xlsx";

async function ReadXLSX(fileName) {
    let workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(fileName);
    return workbook;
}

function MakeDataFromFile(workbook) {
    let countrys = [];
    for (let worksheet of workbook.worksheets) {
        let country = new Country(worksheet.name);
        for (let row = 3; row < worksheet._rows.length; row++) {
            for (let cell of worksheet._rows[row]._cells) {

                console.log(cell._value.model.value);
            }
        }
    }
}

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

ReadXLSX(inputFile).then((workbook) => {
    MakeDataFromFile(workbook);
});

