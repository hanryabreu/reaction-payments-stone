import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { PackageConfig } from "/lib/collections/schemas/registry";
import { registerSchema } from "@reactioncommerce/schemas";

export const StonePackageConfig = PackageConfig.clone().extend({
  // Remove blackbox: true from settings obj
  "settings": {
    type: Object,
    optional: true,
    blackbox: false,
    defaultValue: {}
  },
  "settings.mode": {
    type: Boolean,
    defaultValue: true
  },
  "settings.test": {
    type: Boolean,
    defaultValue: true
  },
  "settings.merchantKey": {
    type: String,
    label: "MerchantKey",
    optional: true
  }
});

registerSchema("StonePackageConfig", StonePackageConfig);

export const StonePayment = new SimpleSchema({
  payerName: {
    type: String,
    label: "Cardholder name"
  },
  brandName: {
    type: String,
    label: "Brand name"
  },
  cardNumber: {
    type: String,
    min: 13,
    max: 16,
    label: "Card number"
  },
  expireMonth: {
    type: String,
    max: 2,
    label: "Expiration month"
  },
  expireYear: {
    type: String,
    max: 2,
    label: "Expiration year"
  },
  cvv: {
    type: String,
    max: 4,
    label: "CVV"
  },
  document: {
    type: Object
  },
  documentNumber: {
    type: String,
    max: 14,
    label: "Document number"
  },
  documentType: {
    type: String,
    allowedValues: ["CPF","CNPJ"],
    label: "Document type",
    autoform: {
      afFieldInput: {
        firstOption: "Select the document type"
      }
    }
  },
}, { check, tracker: Tracker });

registerSchema("StonePayment", StonePayment);
