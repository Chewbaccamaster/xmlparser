
const fs = require('fs');
const util = require('util');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const path = "C:\\Studies\\corporat\\RECADV"; // Change for your file system
const files = [];

const checkForEquality = (quantity1, quantity2, quantity3) => {
    // console.log({quantity1, quantity2, quantity3})
    if (quantity1 != quantity2) {
        return false;
    }
    if (quantity1 != quantity3) {
        return false;
    }
    if (quantity2 != quantity3) {
        return false;
    }
    return true;
}

const wrongFiles = [];
const xmls = fs.readdirSync(path);
for (const xml of xmls) {
    const doc = fs.readFileSync(`${path}\\${xml}`, 'utf8'); // here path is : Your path to xml directory\file.xml
    parser.parseString(doc, (err, data) => {
        // console.log(util.inspect(data, false, null))
        // console.log(data['Document-ReceivingAdvice']['ReceivingAdvice-Header']);
        const goods = data['Document-ReceivingAdvice']['ReceivingAdvice-Lines'];
        for (const good of goods) {
            for (const line of good['Line']) {
                const orderData = line['Line-Item'][0];
                const ordered = orderData['QuantityOrdered'].toString();
                const received = orderData['QuantityReceived'].toString();
                const accepted = orderData['QuantityAccepted'].toString();
                if (!checkForEquality(
                    ordered,
                    received,
                    accepted
                )) {
                    wrongFiles.push({
                        BuyerOrderNumber: data['Document-ReceivingAdvice']['ReceivingAdvice-Header'][0]['BuyerOrderNumber'][0],
                        BuyerOrderDate: data['Document-ReceivingAdvice']['ReceivingAdvice-Header'][0]['BuyerOrderDate'][0],
                        EAN: orderData['EAN'][0],
                        ordered,
                        received,
                        accepted
                    });

                }
            }
        }
    });
}

const fd = fs.openSync('out.txt', 'w');
for (let i = 0; i < wrongFiles.length; i++) {
    fs.appendFileSync(fd, JSON.stringify(wrongFiles[i], null, 3));
    fs.appendFileSync(fd, '\n');

}
fs.closeSync(fd);

