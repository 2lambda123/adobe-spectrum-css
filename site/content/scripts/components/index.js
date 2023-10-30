import Accordion from "./Accordion.js";
import AssetCard from "./AssetCard.js";
import CycleButton from "./CycleButton.js";
import Dial from "./Dial.js";
import InputGroup from "./InputGroup.js";
import Menu from "./Menu.js";
import Picker from "./Picker.js";
import Popover from "./Popover.js";
import ProgressCircle from "./ProgressCircle.js";
import Rating from "./Rating.js";
import Slider from "./Slider.js";
import Stepper from "./Stepper.js";
import Swatch from "./Swatch.js";
import Tabs from "./Tabs.js";
import TextField from "./TextField.js";
import TreeView from "./TreeView.js";

window.addEventListener("DOMContentLoaded", () => {
    [...document.querySelectorAll(".spectrum-Accordion")].forEach((el) => {
        new Accordion(el);
    });

    [...document.querySelectorAll(".spectrum-AssetCard")].forEach((el) => {
        new AssetCard(el);
    });

    [...document.querySelectorAll(".spectrum-CycleButton")].forEach((el) => {
        new CycleButton(el);
    });

    [...document.querySelectorAll(".spectrum-Dial")].forEach((el) => {
        new Dial(el);
    });

    [...document.querySelectorAll(".spectrum-InputGroup")].forEach((el) => {
        new InputGroup(el);
    });

    [...document.querySelectorAll(".spectrum-Menu")].forEach((el) => {
        new Menu(el);
    });

    [...document.querySelectorAll(".spectrum-Picker")].forEach((el) => {
        new Picker(el);
    });

    [...document.querySelectorAll(".spectrum-Popover")].forEach((el) => {
        new Popover(el);
    });

    [...document.querySelectorAll(".spectrum-ProgressCircle")].forEach((el) => {
        new ProgressCircle(el);
    });

    [...document.querySelectorAll(".spectrum-Rating")].forEach((el) => {
        new Rating(el);
    });

    [...document.querySelectorAll(".spectrum-Slider")].forEach((el) => {
        new Slider(el);
    });

    [...document.querySelectorAll(".spectrum-Stepper")].forEach((el) => {
        new Stepper(el);
    });

    [...document.querySelectorAll(".spectrum-Swatch")].forEach((el) => {
        new Swatch(el);
    });

    [...document.querySelectorAll(".spectrum-Tabs")].forEach((el) => {
        new Tabs(el);
    });

    [...document.querySelectorAll(".spectrum-TextField")].forEach((el) => {
        new TextField(el);
    });

    [...document.querySelectorAll(".spectrum-TreeView")].forEach((el) => {
        new TreeView(el);
    });
});
