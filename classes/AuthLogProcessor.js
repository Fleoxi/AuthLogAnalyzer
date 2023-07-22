const fs = require('fs');
const readline = require('readline');
const cliProgress = require('cli-progress');

class AuthLogProcessor 
{
    constructor(Geolocation)
    {
        this.Geolocation = Geolocation;
    }

    async processLogFile(filePath)
    {
        const locations = [];
        let lineCount = 0;

        const totalLines = await this.countLinesInFile(filePath);
        const progressbar = new cliProgress.SingleBar({
            clearOnComplete: false,
            hideCursor: true,
            format: ` {bar} | ${filePath} | {value}/{total}`
        }, cliProgress.Presets.shades_classic);
        progressbar.start(totalLines, 0);

        const rl = readline.createInterface({
            input: fs.createReadStream(filePath),
            crlfDelay: Infinity,
        });

        for await (let line of rl) 
        {
            lineCount++;
            progressbar.update(lineCount);

            const ipAddressMatch = line.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
            if(ipAddressMatch)
            {
                const ipAddress = ipAddressMatch[0];
                line = line.toLowerCase();
                const isConnectionTry = line.includes('accepted') || line.includes('failed');

                if(isConnectionTry)
                {
                    const alreadyKnowLocation = locations.find((location) => location.ip === ipAddress);
                    if(alreadyKnowLocation != undefined)
                    {
                        alreadyKnowLocation.location.count += 1;
                    }
                    else
                    {
                        const location = await this.Geolocation.getLocation(ipAddress);
                        if(location != null)
                        {
                            locations.push(location);
                        }
                    }
                }
            }
        }

        return locations;
    }

    countLinesInFile(filePath) {
        return new Promise((resolve, reject) => {
            let lineCount = 0;
            fs.createReadStream(filePath)
            .on('data', (buffer) => {
                let idx = -1;
                lineCount--;
                do {
                    idx = buffer.indexOf(10, idx + 1);
                    lineCount++;
                } while (idx !== -1);
            }).on('end', () => {
                resolve(lineCount);
            }).on('error', (err) => {
                reject(err);
            });
        });
    }
}

module.exports = AuthLogProcessor;