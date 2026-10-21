const { handler: couponsListHandler } = require("./coupons_list");
const { handler: couponsGetByIdHandler } = require("./coupons_get_by_id");
const { handler: couponsUpdateHandler } = require("./coupons_update");

// Default export is coupons_list handler for Part 1 compatibility
exports.handler = couponsListHandler;
exports.coupons_list = couponsListHandler;
exports.coupons_get_by_id = couponsGetByIdHandler;
exports.coupons_update = couponsUpdateHandler;
