#!/usr/bin/env node
"use strict";

const _ = require('lodash');
const initDb = require('./server/initDb');
const config = require('./config');
const fs  = require('fs');

const Agent = require('./server/models/agent');
const AgentStates = require('./server/models/agentStates');
const Group = require('./server/models/group');

const promises = [];

const groupCount = 200;
const agentCount = 50;

const initializeDB = () => {
  // Remove the dev-db before every seed
  if (fs.existsSync(config.development.db)) {
    fs.unlinkSync(config.development.db);
  }

  initDb().then(() => {
    createGroups();

    Promise.all(promises).then(() => {
      global.db.close(() => {
        global.db.saveDatabase((err) => {
          if (err) {
            console.log("\nerror : " + err);
            process.exit(1);
          }
          else {
            console.log("\nDatabase saved.");
            process.exit();
          }
        });
      });
    }).catch(msg => {
      console.log(msg);
      process.exit(1);
    });
  }).catch(msg => {
    console.log(msg);
    process.exit(1);
  });
};

const randomString = (length) => {
  return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
};

const createAgent = (groupId) => {
  const agentState = AgentStates[Math.floor(Math.random() * AgentStates.length)];
  const agentArgs = {
    name: randomString(10),
    status: agentState,
    groupId: groupId
  };

  const agentPromise = Agent.create(agentArgs);

  promises.push(agentPromise);

  agentPromise.then(agent => {
    console.log(`Created agent ${agent.id} - ${agent.name} in group ${groupId}`);
  }).catch(msg => {
    console.log(msg);
  });
};

const createAgents = (groupId) => {
  _.times(agentCount, () => {
    createAgent(groupId);
  });
};

const createGroup = () => {
  const groupArgs = {
    name: randomString(10)
  };

  const groupPromise = Group.create(groupArgs);

  promises.push(groupPromise);

  groupPromise.then(group => {
    console.log(`Created group ${group.id} - ${group.name}.`);
    createAgents(group.id);
  }).catch(msg => {
    console.log(msg);
  });

};

const createGroups = () => {
  _.times(groupCount, () => {
    createGroup();
  });
};

initializeDB();
