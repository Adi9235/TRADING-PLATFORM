import Joi from "joi";

export const createBrokerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  logo: Joi.string().uri().required(),
  supportedExchanges: Joi.array()
    .items(
      Joi.string().valid(
        "NSE",
        "BSE",
        "MCX",
        "NCDEX",
        "ICEX",
        "NSE FX",
        "BSE FX",
        "MSEI",
        "IEX",
        "PXIL"
      )
    )
    .min(1)
    .required(),
  apiUrl: Joi.string().trim().optional(),
  apiKey: Joi.string().trim().required({
    "string.any": "API key is required",
  }),
  apiSecret: Joi.string().trim().required({
    "string.any": "API Secret is required",
  }),
  connectionFields: Joi.array().items(Joi.string()).unique().required(),
});

export const editBrokerSchema = Joi.object({
  _id: Joi.string().trim().required(),

  logo: Joi.string().uri().required(),
  supportedExchanges: Joi.array()
    .items(
      Joi.string().valid(
        "NSE",
        "BSE",
        "MCX",
        "NCDEX",
        "ICEX",
        "NSE FX",
        "BSE FX",
        "MSEI",
        "IEX",
        "PXIL"
      )
    )
    .min(1)
    .required(),
  apiKey: Joi.string().trim().optional(),
  apiSecret: Joi.string().trim().optional(),
  connectionFields: Joi.array().items(Joi.string()).unique().required(),
});
