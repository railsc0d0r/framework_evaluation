"use strict";

/**
 * An array of all indicator-names to create indicators from.
 *
 * @type {Array}
 */
const IndicatorNames = [
  "CallsTotal",
  "CallsConnecting",
  "CallsInProgress",
  "CallsWaiting",
  "CallsMaxWait",
  "ServiceLevel_00",
  "Availability_00",
  "AverageHandlingTimeInSec",
  "AverageHandlingTimeSinceMidnight",
  "AverageWrapUpTime",
  "AverageWrapUpTime_00",
  "TimeUntilCallsHandledInboundSinceMidnight",
  "TimeUntilCallsAbortedByCallerInboundSinceMidnight",
  "AvailableTimeSinceMidnight",
  "CallsSinceMidnight",
  "HandledCallsSinceMidnight",
  "AbandonedCallsInRealQueueSinceMidnight",
  "WTimeInRealQueueSinceMidnight",
  "CallsLessThanXSecInboundSinceMidnight",
  "TakeOversFromThisGroupInboundSinceMidnight",
  "AgentsFree",
  "AgentsFreeWithoutLocallyBusy",
  "AgentsLocallyBusy",
  "AgentsRefinish",
  "AgentsBreak",
  "AgentsProductiveBreak",
  "AgentsReserved",
  "AgentsBusy",
  "AgentsLoggedIn",
  "OpenResubmissions"
];

module.exports = IndicatorNames;
