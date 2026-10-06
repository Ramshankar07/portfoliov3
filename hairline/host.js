/*
 * Hosts the footer's Hairline figure (hairline/teardown.js) on the kernel
 * (hairline/kernel.js, unchanged from the package). It does the bench's job
 * without the bench: makes the svg, hands the figure its stage and read-out,
 * and mounts it once at the figure's default. The kernel's loop sleeps while
 * the footer is offscreen and holds still under reduced motion.
 */
(() => {
    let mounted = false;
    window.hairline = (figure) => {
        const stage = document.querySelector('[data-hairline-host]');
        if (mounted || !stage || !window.HL) return;
        mounted = true;
        const caption = document.querySelector('[data-hairline-read]');
        const atRest = caption ? caption.textContent : '';
        HL.inject(document);
        stage.setAttribute('data-hairline', figure.name);
        stage.setAttribute('role', 'img');
        stage.setAttribute('aria-label', figure.means);
        const svg = HL.mk('svg', { viewBox: '0 0 400 320', 'aria-hidden': 'true' }, stage);
        let text = 'rest';
        const read = {
            get textContent() { return text; },
            set textContent(value) {
                text = value == null ? '' : String(value);
                if (caption) caption.textContent = text === 'rest' ? atRest : text;
            },
        };
        figure.mount({ stage, svg, read }, figure.range[1]);
    };
})();
