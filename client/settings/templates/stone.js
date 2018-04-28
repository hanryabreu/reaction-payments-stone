import { Template } from "meteor/templating";
import { StoneSettingsFormContainer } from "../containers";
import "./stone.html";

Template.stoneSettings.helpers({
  StoneSettings() {
    return {
      component: StoneSettingsFormContainer
    };
  }
});
