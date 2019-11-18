const domain = require('../lib/index');
const moment = require('moment');

async function main() {
    await domain.mongoose.connect(process.env.MONGOLAB_URI);
    const taskRepo = new domain.repository.Task(domain.mongoose.connection);
    const telemetryRepo = new domain.repository.Telemetry(domain.mongoose.connection);

    let result;
    const deleteThrough = moment()
        .add(-6, 'months')
        .toDate();

    result = await taskRepo.taskModel.deleteMany({
        createdAt: {
            $lt: deleteThrough
        }
    })
        .exec();
    console.log(result);

    result = await telemetryRepo.telemetryModel.deleteMany({
        'object.measureDate': {
            $exists: true,
            $lt: deleteThrough
        }
    })
        .exec();
    console.log(result);
}

main().then(() => {
    console.log('success!');
})
    .catch(console.error);
