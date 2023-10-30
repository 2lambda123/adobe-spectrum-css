class AccordionItem {
    constructor(el) {
        if (!el) return;

        this.el = el;

        this.clickHandler = this.clickHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);

        this.el.addEventListener("click", this.clickHandler);
        this.el.addEventListener("keydown", this.keydownHandler);
    }

    get isDemo() {
        return this.el.closest(".site-Example-preview") !== null;
    }

    get isOpen() {
        return this.el.classList.contains("is-open");
    }

    set isOpen(state) {
        // cast to boolean if passed a string
        state = Boolean(state);
        if (state === this.isOpen) return;
        this.el.classList.toggle("is-open", state);

        if (!this.isDemo) return;

        // Dispatch a custom event so that the preview can update the markup
        this.el.dispatchEvent(new CustomEvent("markupChanged", { bubbles: true }));
    }

    get isDisabled() {
        return this.el.classList.contains("is-disabled");
    }

    set isDisabled(state) {
        // cast to boolean if passed a string
        state = Boolean(state);
        if (state === this.isDisabled) return;
        this.el.classList.toggle("is-disabled", state);
    }

    clickHandler(event) {
        if (this.isDisabled) return;
        event.preventDefault();
        this.isOpen = !this.isOpen;
    }

    keydownHandler(event) {
        if (this.isDisabled) return;
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.isOpen = !this.isOpen;
        }
    }
}

export default class Accordion {
    constructor(el) {
        if (!el) return;

        this.el = el;

        this.items.forEach((item) => {
            new AccordionItem(item);
        });
    }

    get items() {
        return [...this.el.querySelectorAll(".spectrum-Accordion-item")];
    }

    get isDemo() {
        return this.el.closest(".site-Example-preview") !== null;
    }

    get markupChangeEvent() {
        return new CustomEvent("markupChanged", { bubbles: true });
    }
}
