const mongoose = require('mongoose');
const domain = require('../lib')
const trasaction = require('./transaction.json');

async function main() {
    await mongoose.connect(process.env.MONGOLAB_URI);

    const telemetryRepo = new domain.repository.Telemetry(mongoose.connection);

    await domain.service.telemetry.analyzePlaceOrder(trasaction)({ telemetry: telemetryRepo });

    // await mongoose.disconnect();
}

main().then(() => {
    console.log('success!');
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
