const crypto = require('crypto');
const EventEmitter = require('events');

// Global in-memory storage simulating collections
const dbStore = {
  User: [],
  Startup: [],
  Investment: [],
  Blog: [],
  AuditLog: []
};

// Default schemas fields initializer
const schemaDefaults = {
  User: {
    walletBalance: 100000,
    role: 'investor',
    portfolio: []
  },
  Startup: {
    status: 'pending',
    raisedAmount: 0,
    pastValuations: [],
    founderName: 'DTU Incubator Representative'
  },
  Investment: {
    timestamp: new Date()
  },
  Blog: {
    author: 'System Admin',
    timestamp: new Date()
  },
  AuditLog: {
    timestamp: new Date()
  }
};

function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

class MockSession {
  startTransaction() {
    // console.log('Mock Transaction Started');
  }
  async commitTransaction() {
    // console.log('Mock Transaction Committed');
  }
  async abortTransaction() {
    // console.log('Mock Transaction Aborted');
  }
  endSession() {}
}

class MockConnection extends EventEmitter {
  constructor() {
    super();
    this.readyState = 1; // Connected
  }
}

const mockConnection = new MockConnection();

class MockQuery extends Array {
  populate(path) {
    if (path === 'startupId') {
      const startups = dbStore['Startup'] || [];
      for (const doc of this) {
        if (doc.startupId) {
          const idStr = doc.startupId.toString();
          const startup = startups.find(s => s._id.toString() === idStr);
          if (startup) {
            doc.startupId = JSON.parse(JSON.stringify(startup));
          }
        }
      }
    }
    return this;
  }

  lean() {
    return this;
  }
}

const Schema = class {
  constructor(definition, options) {
    this.definition = definition;
    this.options = options;
  }
};
Schema.Types = {
  ObjectId: 'ObjectId'
};

const mockMongoose = {
  Schema,
  connection: mockConnection,

  model(modelName, schema) {
    if (!dbStore[modelName]) {
      dbStore[modelName] = [];
    }

    const collection = dbStore[modelName];

    class MockModel {
      constructor(data) {
        const defaults = schemaDefaults[modelName] || {};
        const mergedData = Object.assign({}, defaults, data);
        Object.assign(this, mergedData);
        if (!this._id) {
          this._id = generateId();
        }
        if (!this.createdAt) {
          this.createdAt = new Date();
        }
        if (!this.updatedAt) {
          this.updatedAt = new Date();
        }
      }

      async save(options = {}) {
        const idx = collection.findIndex(item => item._id.toString() === this._id.toString());
        if (idx !== -1) {
          collection[idx] = this;
        } else {
          collection.push(this);
        }
        return this;
      }

      session(sess) {
        return this; // Allow chaining
      }

      static session(sess) {
        return this; // Allow static chaining
      }

      static async find(query = {}) {
        let results = collection;
        for (const key in query) {
          results = results.filter(item => {
            const val = query[key];
            if (Array.isArray(val)) {
              return val.includes(item[key]);
            }
            return item[key] === val;
          });
        }
        // Deep copy results to mock DB isolation
        const models = results.map(item => new MockModel(JSON.parse(JSON.stringify(item))));
        return MockQuery.from(models);
      }

      static async findOne(query = {}) {
        const results = await this.find(query);
        return results[0] || null;
      }

      static async findById(id) {
        const idStr = id && id._id ? id._id.toString() : String(id);
        const item = collection.find(doc => doc._id.toString() === idStr);
        return item ? new MockModel(JSON.parse(JSON.stringify(item))) : null;
      }

      static async findByIdAndUpdate(id, update, options = {}) {
        const idStr = String(id);
        const item = collection.find(doc => doc._id.toString() === idStr);
        if (!item) return null;

        Object.assign(item, update);
        return new MockModel(JSON.parse(JSON.stringify(item)));
      }

      static async findByIdAndDelete(id) {
        const idStr = id && id._id ? id._id.toString() : String(id);
        const idx = collection.findIndex(doc => doc._id.toString() === idStr);
        if (idx !== -1) {
          const removed = collection.splice(idx, 1)[0];
          return new MockModel(JSON.parse(JSON.stringify(removed)));
        }
        return null;
      }

      static async deleteMany(query = {}) {
        if (Object.keys(query).length === 0) {
          collection.length = 0;
          return { deletedCount: 0 };
        }
        let initialLength = collection.length;
        const remaining = collection.filter(item => {
          for (const key in query) {
            const val = query[key];
            const itemVal = item[key] && item[key]._id ? item[key]._id.toString() : String(item[key]);
            const compareVal = val && val._id ? val._id.toString() : String(val);
            if (itemVal === compareVal) return false;
          }
          return true;
        });
        collection.length = 0;
        collection.push(...remaining);
        return { deletedCount: initialLength - collection.length };
      }

      static async countDocuments(query = {}) {
        const results = await this.find(query);
        return results.length;
      }
    }

    return MockModel;
  },

  async connect() {
    console.log('--- Mock Database Connection Established Successfully ---');
    mockConnection.emit('connected');
    return true;
  },

  async startSession() {
    return new MockSession();
  }
};

module.exports = mockMongoose;
