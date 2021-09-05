"use strict";

const {
  getCurrentMonthsExpense,
  getTodaysExpense,
  getAvgExpense,
  getAvgIncome,
  dailyExpense,
} = require("../../../../controllers/home");

module.exports = async function (fastify, opts) {
  fastify.get(
    "/month-expense",
    { preHandler: [fastify.authenticate] },
    getCurrentMonthsExpense
  );
  fastify.get(
    "/today-expense",
    { preHandler: [fastify.authenticate] },
    getTodaysExpense
  );
  fastify.get(
    "/avg-expense",
    { preHandler: [fastify.authenticate] },
    getAvgExpense
  );
  fastify.get(
    "/avg-dual",
    { preHandler: [fastify.authenticate] },
    getAvgIncome
  );
  fastify.get(
    "/daily-expense",
    { preHandler: [fastify.authenticate] },
    dailyExpense
  );
};
