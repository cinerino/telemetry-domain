import { WriteConcern } from 'mongoose';

const writeConcern: WriteConcern = { j: true, w: 'majority', wtimeout: 10000 };

export { writeConcern };
