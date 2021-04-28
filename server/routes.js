"use strict";

const Agent = require('./models/agent');
const AgentStates = require('./models/agentStates');
const Group = require('./models/group');
const IndicatorNames = require('./models/indicatorNames');
const Indicator = require('./models/indicator');

/**
 * Defines the routes as provided l8r by /api/
 *
 * @param router - An instance the router as returned by of express.Router()
 */
const routes = function(router) {
  router.get('/', function(req, res) {
    res.json({message: 'Success'});
  });

  router.get('/agent_states', function(req, res) {
    res.json({ agent_states: AgentStates });
  });

  router.route('/agents')
    .get(function (req, res) {
      const failCallback = msg => {
      };

      Agent.all().then(agents => {
        let responseBody = {agents: []};

        agents.forEach(agent => {
          responseBody.agents.push(agent.serializeAttributes());
        });

        res.json(responseBody);
      }).catch(failCallback);
    })
    .post(function (req, res) {
      let agentArgs = req.body.agent;

      Agent.create(agentArgs).then(agent => {
        const responseBody = { agent: agent.serializeAttributes() };

        res.status(201);
        res.append('location', `${req.baseUrl}${req.path}/${agent.id}`);
        res.json(responseBody);
      }).catch(errors => {
        res.status(400);
        res.json({ errors: errors });
      });
    });

  router.route('/agents/:id')
    .get(function (req, res) {
      Agent.find(req.params.id).then(agent => {
        let responseBody = { agent: agent.serializeAttributes() };

        res.json(responseBody);
      }).catch(errors => {
        res.status(404);
        res.json({ errors: errors });
      });
    })
    .patch(function (req, res) {
      Agent.find(req.params.id).then(agent => {
        let agentArgs = req.body.agent;
        agent.update(agentArgs).then(() => {
          res.json('OK');
        }).catch(errors => {
          res.status(400);
          res.json({errors: errors});
        });
      }).catch(errors => {
        res.status(404);
        res.json({errors: errors});
      });
    })
    .delete(function(req, res) {
      Agent.find(req.params.id).then(agent => {
        agent.destroy().then(() => {
          res.json('OK');
        }).catch(errors => {
          res.status(400);
          res.json({errors: errors});
        });
      }).catch(errors => {
        res.status(404);
        res.json({errors: errors});
      });
    });

  router.route('/groups')
    .get(function (req, res) {
      let promiseArray = [];
      let responseBody = {
        groups: []
      };

      const failCallback = msg => {
      };

      const groupsPromise = Group.all().then(groups => {
        groups.forEach(group => {
          let jsonObject = group.serializeAttributes();
          let groupPromiseArray = [];

          const agentsPromise = group.agents.then(agents => {
            let agentIds = [];

            agents.forEach(agent => {
              agentIds.push(agent.id);
            });

            jsonObject.agents = agentIds;
          });

          groupPromiseArray.push(agentsPromise);

          const indicatorsPromise = group.indicators.then(indicators => {
            let indicatorIds = [];

            indicators.forEach(indicator => {
              indicatorIds.push(indicator.id);
            });

            jsonObject.indicators = indicatorIds;
          });

          groupPromiseArray.push(indicatorsPromise);

          const groupPromises = Promise.all(groupPromiseArray).then(() => {
            responseBody.groups.push(jsonObject);
          });

          promiseArray.push(groupPromises);
        });

        Promise.all(promiseArray).then(() => {
          res.json(responseBody);
        }).catch(failCallback);
      });

      promiseArray.push(groupsPromise);
    })
    .post(function(req, res) {
      let groupArgs = req.body.group;

      Group.create(groupArgs).then(group => {
        const responseBody = { group: group.serializeAttributes() };

        res.status(201);
        res.append('location', `${req.baseUrl}${req.path}/${group.id}`);
        res.json(responseBody);
      }).catch(errors => {
        res.status(400);
        res.json({ errors: errors });
      });
    });

  router.route('/groups/:id')
    .get(function (req, res) {
      Group.find(req.params.id).then(group => {
        let promiseArray = [];

        const failCallback = msg => {
        };

        let responseBody = { group: group.serializeAttributes() };

        const agentsPromise = group.agents.then(agents => {
          let agentIds = [];

          agents.forEach(agent => {
            agentIds.push(agent.id);
          });

          responseBody.group.agents = agentIds;
        });

        promiseArray.push(agentsPromise);

        const indicatorsPromise = group.indicators.then(indicators => {
          let indicatorIds = [];

          indicators.forEach(indicator => {
            indicatorIds.push(indicator.id);
          });

          responseBody.group.indicators = indicatorIds;
        });

        promiseArray.push(indicatorsPromise);

        Promise.all(promiseArray).then(() => {
          res.json(responseBody);
        }).catch(failCallback);
      }).catch(errors => {
        res.status(404);
        res.json({ errors: errors });
      });
    })
    .patch(function (req, res) {
      Group.find(req.params.id).then(group => {
        let groupArgs = req.body.group;
        group.update(groupArgs).then(() => {
          res.json('OK');
        }).catch(errors => {
          res.status(400);
          res.json({errors: errors});
        });
      }).catch(errors => {
        res.status(404);
        res.json({errors: errors});
      });
    })
    .delete(function(req, res) {
      Group.find(req.params.id).then(group => {
        group.destroy().then(() => {
          res.json('OK');
        }).catch(errors => {
          res.status(400);
          res.json({errors: errors});
        });
      }).catch(errors => {
        res.status(404);
        res.json({errors: errors});
      });
    });

  router.get('/groups/:id/indicators', function(req, res) {
    Group.find(req.params.id).then(group => {
      group.indicators.then(indicators => {
        let responseBody = {indicators: []};

        indicators.forEach(indicator => {
          responseBody.indicators.push(indicator.serializeAttributes());
        });

        res.json(responseBody);
      })
    }).catch(errors => {
      res.status(404);
      res.json({errors: errors});
    });
  });

  router.get('/groups/:id/agents', function(req, res) {
    Group.find(req.params.id).then(group => {
      group.agents.then(agents => {
        let responseBody = {agents: []};

        agents.forEach(agent => {
          responseBody.agents.push(agent.serializeAttributes());
        });

        res.json(responseBody);
      })
    }).catch(errors => {
      res.status(404);
      res.json({errors: errors});
    });
  });

  router.get('/indicator_names', function(req, res) {
    res.json({ indicator_names: IndicatorNames });
  });

  router.get('/indicators', function(req, res) {
    const failCallback = msg => {
      console.log(msg);
    };

    Indicator.all().then(indicators => {
      let responseBody = {
        indicators: []
      };

      indicators.forEach(indicator => {
        responseBody.indicators.push(indicator.serializeAttributes());
      });

      res.json(responseBody);
    }).catch(failCallback);
  });
};

module.exports = routes;
