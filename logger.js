const logs = [];

const log = (output) => {
    console.log(output);
    logs.push({
        time: new Date(Date.now()),
        output: output
    });
}

module.exports = {
    logs: logs,
    log: log,
}