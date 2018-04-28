/* eslint camelcase: 0 */
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { AutoForm } from "meteor/aldeed:autoform";
import { $ } from "meteor/jquery";
import { Reaction } from "/client/api";
import { Cart, Shops, Packages } from "/lib/collections";
import { Stone } from "../../lib/api";
import { StonePayment } from "../../lib/collections/schemas";

import "./stone.html";

let submitting = false;

function uiEnd(template, buttonText) {
  template.$(":input").removeAttr("disabled");
  template.$("#btn-complete-order").text(buttonText);
  return template.$("#btn-processing").addClass("hidden");
}

function paymentAlert(errorMessage) {
  return $(".alert").removeClass("hidden").text(errorMessage);
}

function hidePaymentAlert() {
  return $(".alert").addClass("hidden").text("");
}

function handleStoneSubmitError(error) {
  const serverError = error !== null ? error.message : undefined;
  if (serverError) {
    return paymentAlert(`Oops! ${serverError}`);
  } else if (error) {
    return paymentAlert(`Oops! ${error}`, null, 4);
  }
}


Template.stoneGatewayForm.helpers({
  StonePayment() {
    return StonePayment;
  }
});

AutoForm.addHooks("stone-gateway-form", {
  onSubmit(doc) {
    submitting = true;
    const { template } = this;
    hidePaymentAlert();
    const form = {
      name: doc.payerName,
      number: doc.cardNumber,
      expireMonth: doc.expireMonth,
      expireYear: doc.expireYear,
      cvv2: doc.cvv,
      type: Reaction.getCardType(doc.cardNumber),
      documentNumber: doc.documentNumber,
      documentType: doc.documentType
    };
    const storedCard = `${form.type.charAt(0).toUpperCase() + form.type.slice(1)} ${doc.cardNumber.slice(-4)}`;
    Meteor.subscribe("Packages", Reaction.getShopId());
    const packageData = Packages.findOne({
      name: "stone-gateway",
      shopId: Reaction.getShopId()
    });
    Stone.authorize(form, {
      total: Cart.findOne().getTotal(),
      currency: Shops.findOne().currency
    }, (error, transaction) => {
      submitting = false;
      let paymentMethod;
      if (error) {
        handleStoneSubmitError(error);
        uiEnd(template, "Resubmit payment");
      } else if (transaction.saved === true) {
        submitting = false;
        paymentMethod = {
          processor: "Stone",
          paymentPackageId: packageData._id,
          paymentSettingsKey: packageData.registry[0].settingsKey,
          storedCard,
          method: "credit",
          transactionId: transaction.transactionId,
          riskLevel: transaction.riskLevel,
          currency: transaction.currency,
          amount: transaction.amount,
          installmentCount: transaction.installmentCount,
          status: transaction.status,
          mode: "authorize",
          createdAt: new Date(),
          transactions: []
        };
        paymentMethod.transactions.push(transaction.response);
        Meteor.call("cart/submitPayment", paymentMethod);
      } else {
        handleStoneSubmitError(transaction.error);
        uiEnd(template, "Resubmit payment");
      }
    });
    return false;
  },
  beginSubmit() {
    this.template.$(":input").attr("disabled", true);
    this.template.$("#btn-complete-order").text("Submitting ");
    return this.template.$("#btn-processing").removeClass("hidden");
  },
  endSubmit() {
    if (!submitting) {
      return uiEnd(this.template, "Complete your order");
    }
  }
});
