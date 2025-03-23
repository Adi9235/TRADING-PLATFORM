import Joi from "joi";

export const userRegisterationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "A valid email address is required",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  name: Joi.string().min(3).max(30).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name must be at most 30 characters long",
  }),

  password: Joi.string().min(6).max(30).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters long",
    "string.max": "Password must be at most 30 characters long",
    "any.required": "Password is required",
  }),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "A valid email address is required",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(6).max(30).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters long",
    "string.max": "Password must be at most 30 characters long",
    "any.required": "Password is required",
  }),
});
