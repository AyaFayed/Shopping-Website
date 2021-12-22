const Joi = require("joi");
module.exports.userSchema = Joi.object({
  user: Joi.object({
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(6).max(50).required(),
    cart: Joi.any().optional(),
  }),
});
