import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import Reaction from "/lib/api";

export const Stone = {
  stoneAccountOptions() {
    const { settings } = Packages.findOne({
      name: "stone-gateway",
      merchantReference: Reaction.getShopId(),
      enabled: true
    });
    if (!settings.merchantKey) {
      throw new Meteor.Error("invalid-credentials", "Invalid Credentials");
    }
    return settings.merchantKey;
  },

  authorize(cardInfo, paymentInfo, callback) {
    Meteor.call("stoneSubmit", "authorize", cardInfo, paymentInfo, callback);
  }
};
