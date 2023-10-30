export default class Popover {
    constructor(el) {
        if (!el) return;

        this.el = el;

        if (this.el.previousElementSibling) {
            this.alignment(this.el.previousElementSibling, 8);
        }
    }

    /* -- State utilities -- */
    get isOpen() {
        return this.el.classList.contains("is-open");
    }

    set isOpen(state) {
        this.el.classList.toggle("is-open", state);
    }
    /** -- end -- */

    get hasTip() {
        return this.el.classList.contains("spectrum-Popover--withTip");
    }

    set hasTip(state) {
        this.el.classList.toggle("spectrum-Popover--withTip", state);
    }

    /**
     * @description Sets the position of the popover relative to the trigger
     * @memberof Popover
     * @param {(top|bottom|left|right|start|end)[]} position
     */
    set position(position = []) {
        // @todo could do validation here
        this.el.classList.toggle(`spectrum-Popover--${position.join("-")}`, true);
    }

    get menu() {
        return this.el.querySelector(".spectrum-Menu");
    }

    alignment(relativeTo, offset = 0) {
        if (!relativeTo) return;
        const rect = relativeTo.getBoundingClientRect();
        this.el.style.top = `${rect.bottom + offset}px`;

        if (this.el.isRTL) {
            this.el.style.right = `${window.innerWidth - rect.right}px`;
            this.el.style.left = "auto";
        } else {
            this.el.style.right = "auto";
            this.el.style.left = `${rect.left}px`;
        }
    }

    /**
     * @param {string|HTMLElement} content
     */
    set content(content) {
        if (typeof content === "string") {
            this.el.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.el.innerHTML = "";
            this.el.appendChild(content);
        }
    }
}
