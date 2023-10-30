export default class ProgressCircle {
    constructor(el) {
        if (!el) return;

        this.el = el;

        this.submask1 = this.el.querySelector(".spectrum-ProgressCircle-fillSubMask1");
        this.submask2 = this.el.querySelector(".spectrum-ProgressCircle-fillSubMask2");

        // Wait until the DOM content is loaded and then start the animation
        window.addEventListener("DOMContentLoaded", this.animate.bind(this));
    }

    get isIndeterminate() {
        return this.el.classList.contains("spectrum-ProgressCircle--indeterminate");
    }

    set isIndeterminate(state) {
        this.el.classList.toggle("spectrum-ProgressCircle--indeterminate", state);
    }

    update(value) {
        if (value > 0 && value <= 50) {
            const angle = -180 + (value / 50) * 180;
            if (this.submask1) this.submask1.style.transform = "rotate(" + angle + "deg)";
            if (this.submask2) this.submask2.style.transform = "rotate(-180deg)";
            return;
        }

        if (value > 50) {
            const angle = -180 + ((value - 50) / 50) * 180;
            if (this.submask1) this.submask1.style.transform = "rotate(0deg)";
            if (this.submask2) this.submask2.style.transform = "rotate(" + angle + "deg)";
        }
    }

    animate() {
        let value = 0;
        setInterval(() => {
            if (this.isIndeterminate) return;

            this.update(++value);
            if (value >= 100) value = 0;
        }, 500);
    }
}
