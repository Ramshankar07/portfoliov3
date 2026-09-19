/**
 * Editorial Single-Page Portfolio Controller
 * Coordinates theme toggling, scroll-spy navigation, category filtering,
 * the Gemini-powered search chatbot, WebMCP AI Agent tools,
 * and the interactive visual "Agent Mode" console.
 */

// ── Theme Handling ──
const THEME_STORAGE_KEY = 'theme';

function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
}

function getStoredTheme() {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
        return null;
    }
}

function storeTheme(theme) {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Ignore storage errors
    }
}

function getCurrentTheme() {
    const stored = getStoredTheme();
    if (stored === 'light' || stored === 'dark') {
        return stored;
    }
    // Default to dark mode
    return 'dark';
}

function updateThemeToggleUI(theme) {
    const toggles = document.querySelectorAll('[data-theme-toggle]');
    toggles.forEach(toggle => {
        toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        const moonIcon = toggle.querySelector('[data-icon="moon"]');
        const sunIcon = toggle.querySelector('[data-icon="sun"]');
        if (moonIcon && sunIcon) {
            if (theme === 'dark') {
                moonIcon.classList.add('hidden');
                sunIcon.classList.remove('hidden');
            } else {
                moonIcon.classList.remove('hidden');
                sunIcon.classList.add('hidden');
            }
        }
    });
}

function initTheme() {
    const theme = getCurrentTheme();
    applyTheme(theme);
    storeTheme(theme);
    updateThemeToggleUI(theme);
}

function setupThemeToggle() {
    const toggles = document.querySelectorAll('[data-theme-toggle]');
    if (!toggles.length) return;

    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const current = getCurrentTheme();
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            storeTheme(next);
            updateThemeToggleUI(next);
        });
    });
}

// ── Core DOM Setup ──
document.addEventListener('DOMContentLoaded', function() {
    // 1. Initialize Theme
    initTheme();
    setupThemeToggle();

    // 2. Mobile Navigation Toggle Drawer
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNavMenu = document.getElementById('mobile-nav-menu');

    if (mobileMenuBtn && mobileNavMenu) {
        const setMenuOpen = (open) => {
            mobileNavMenu.classList.toggle('hidden', !open);
            mobileNavMenu.classList.toggle('flex', open);
            mobileMenuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            mobileMenuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');

            const spans = mobileMenuBtn.querySelectorAll('span');
            if (spans.length === 3) {
                spans[0].classList.toggle('rotate-45', open);
                spans[0].classList.toggle('translate-y-2', open);
                spans[1].classList.toggle('opacity-0', open);
                spans[2].classList.toggle('-rotate-45', open);
                spans[2].classList.toggle('-translate-y-2', open);
            }
        };

        mobileMenuBtn.addEventListener('click', function() {
            const isOpen = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            setMenuOpen(!isOpen);
        });

        // Close mobile menu when a nav link is clicked
        const mobileLinks = mobileNavMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => setMenuOpen(false));
        });
    }

    // 3. Smooth Scrolling for Navigation Anchor Hashes
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                history.pushState(null, null, targetId);
            }
        });
    });

    // 4. Scroll-Spy Navigation Highlighting (IntersectionObserver)
    // Only sections that actually have a nav link are observed. Watching every
    // <section> meant any section without one — a closing piece, an interlude —
    // cleared `.active` from every link while it was onscreen, blanking the
    // whole nav. Filtering here makes adding a section safe by default instead
    // of a footgun documented in DESIGN.md.
    const navLinks = document.querySelectorAll('#nav-links a');
    const navTargets = new Set(
        [...navLinks]
            .map(a => a.getAttribute('href'))
            .filter(h => h && h.startsWith('#'))
            .map(h => h.slice(1))
    );
    const sections = [...document.querySelectorAll('section[id]')]
        .filter(sec => navTargets.has(sec.id));

    if (sections.length && navLinks.length) {
        const observerOptions = {
            root: null,
            rootMargin: '-30% 0px -50% 0px', // Highlights active navigation as sections cross middle viewport
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const activeId = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        const href = link.getAttribute('href');
                        if (href === `#${activeId}`) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }

    // 5. Client-Side Projects Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('#projects-grid > div');

    if (filterButtons.length && projectCards.length) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Toggle active styles + pressed state for a11y
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-pressed', 'true');

                const filter = this.getAttribute('data-filter');

                projectCards.forEach(card => {
                    const categories = card.getAttribute('data-category').split(' ');
                    if (filter === 'all' || categories.includes(filter)) {
                        card.style.display = 'block';
                        card.style.opacity = '0';
                        setTimeout(() => {
                            card.style.transition = 'opacity 0.3s ease';
                            card.style.opacity = '1';
                        }, 30);
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // 6. Search Chatbot Form Handling (WebMCP Interceptor)
    const searchForm = document.getElementById('chat-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            // Check if triggered by WebMCP agent invocation
            if (e.agentInvoked) {
                e.preventDefault();
                const queryVal = document.getElementById('chat-input').value.trim();
                if (!queryVal) {
                    e.respondWith(Promise.resolve("Error: Search query cannot be empty."));
                    return;
                }

                const resultPromise = new Promise((resolve) => {
                    fetch('https://portfolio-chatbot-staging.picographer0214.workers.dev/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: queryVal, useGemini: true })
                    })
                    .then(response => {
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        return response.json();
                    })
                    .then(data => {
                        resolve(data.response);
                        showNotification('Semantic query dispatched via WebMCP agent call!', 'success');
                    })
                    .catch(err => {
                        resolve(`Error fetching chatbot insights: ${err.message}`);
                    });
                });

                e.respondWith(resultPromise);
            }
        });
    }

    // 9. Initialize Search Chatbot Client
    new PortfolioChatbot();

    // 10. Interactive visual Agent Mode Dashboard Controller
    setupAgentModeDashboard();

    // 11. Right-margin scroll-progress rail
    setupScrollProgress();

    // 12. Closing piece + section motion
    setupScheduler();
    setupSectionMotion();
});

// ── Margin Scroll-Progress Rail ──
function setupScrollProgress() {
    const fill = document.getElementById('rail-progress');
    if (!fill) return;

    let ticking = false;
    const update = () => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        const ratio = max > 0 ? Math.min(Math.max(doc.scrollTop / max, 0), 1) : 0;
        fill.style.transform = 'scaleY(' + ratio.toFixed(4) + ')';
        ticking = false;
    };

    // One rAF-coalesced scheduler for every trigger, so a resize that arrives
    // in the same frame as a scroll still costs a single measurement.
    const schedule = () => {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(update);
        }
    };

    window.addEventListener('scroll', schedule, { passive: true });

    // The ratio is a function of document height as well as scroll offset, so
    // anything that reflows the page invalidates it. Filtering the project
    // grid or opening the agent dashboard changes the height without emitting
    // a scroll event, which used to leave the rail showing a stale depth until
    // the next scroll. Observing the body covers those and window resizes both.
    window.addEventListener('resize', schedule);
    if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(schedule).observe(document.body);
    }

    update();
}

// ── Notification Alert Toast ──
function showNotification(message, type) {
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification fixed top-24 right-6 z-50 p-4 rounded-xl shadow-2xl transform transition-all duration-300 translate-x-[150%] max-w-sm font-medium text-sm`;
    
    if (type === 'success') {
        notification.classList.add('bg-black', 'text-white', 'border', 'border-neutral-800', 'dark:bg-white', 'dark:text-black');
    } else {
        notification.classList.add('bg-red-600', 'text-white');
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
        notification.classList.remove('translate-x-[150%]');
    }, 50);
    
    // Slide out and remove
    setTimeout(() => {
        notification.classList.add('translate-x-[150%]');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4500);
}

// ── Search Chatbot Widget Class ──
class PortfolioChatbot {
    constructor() {
        this.apiUrl = 'https://portfolio-chatbot-staging.picographer0214.workers.dev';
        this.isLoading = false;
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.chatSearchForm = document.getElementById('chat-search-form');
        this.chatInput = document.getElementById('chat-input');
        this.chatSend = document.getElementById('chat-send');
    }

    bindEvents() {
        this.chatSearchForm?.addEventListener('submit', (e) => {
            // Prevent normal submission from reloading the page
            e.preventDefault();
            if (!e.agentInvoked) {
                this.sendMessage();
            }
        });
        
        // Auto focus the search widget on load - pointer devices only.
        // On a phone this scrolled the page to the widget (measured: scrollY 747
        // at 390x844), putting the headline, the lead and both CTAs off screen
        // before the visitor had read a word, and opened the keyboard over what
        // was left. preventScroll keeps even the desktop case from moving the
        // page if the widget ever falls below the fold.
        if (window.matchMedia('(min-width: 768px)').matches) {
            setTimeout(() => {
                this.chatInput?.focus({ preventScroll: true });
            }, 600);
        }
    }

    async sendMessage() {
        const query = this.chatInput?.value.trim();
        if (!query || this.isLoading) return;

        this.setLoading(true);
        
        try {
            const response = await fetch(`${this.apiUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: query,
                    useGemini: true
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.showResult(data.response);
            this.chatInput.value = '';
            
        } catch (error) {
            console.error('Chatbot search error:', error);
            this.showResult('Sorry, I encountered an error attempting to process your search. Please check your network and try again.');
        } finally {
            this.setLoading(false);
        }
    }

    showResult(message) {
        const resultModal = document.getElementById('search-result-modal');
        if (!resultModal) return;

        resultModal.innerHTML = `
            <div class="bg-white dark:bg-[#151515] border border-gray-200 dark:border-neutral-800 rounded-2xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative transition-all duration-300 transform scale-100 flex flex-col justify-between space-y-6">
                
                <div class="flex items-center justify-between border-b dark:border-neutral-800 pb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center bg-black dark:bg-white text-white dark:text-black">
                            <i class="fas fa-search text-xs"></i>
                        </div>
                        <h3 class="text-lg font-bold">Search Insights</h3>
                    </div>
                    <button id="close-result" class="text-gray-400 hover:text-black dark:hover:text-white transition-colors" aria-label="Close modal">
                        <i class="fas fa-times text-lg"></i>
                    </button>
                </div>
                
                <div class="text-sm text-gray-600 dark:text-neutral-300 leading-relaxed font-light whitespace-pre-wrap flex-1">${message}</div>
                
                <div class="flex justify-end pt-4 border-t dark:border-neutral-800">
                    <button id="ok-result" class="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black font-semibold text-xs rounded-lg hover:opacity-85">
                        Dismiss
                    </button>
                </div>
            </div>
        `;

        // Slide in overlay
        resultModal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden'); // Disable background scroll

        const closeElements = [
            document.getElementById('close-result'),
            document.getElementById('ok-result'),
            resultModal
        ];

        const hideModal = () => {
            resultModal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
            // Returning focus to the field the dialog came from is correct, but
            // it must not drag the page there.
            this.chatInput?.focus({ preventScroll: true });
        };

        closeElements.forEach((el, index) => {
            if (!el) return;
            if (index === 2) {
                // Click outside modal container
                el.addEventListener('click', (e) => {
                    if (e.target === resultModal) hideModal();
                });
            } else {
                el.addEventListener('click', hideModal);
            }
        });
    }

    setLoading(loading) {
        this.isLoading = loading;
        if (this.chatSend) {
            this.chatSend.disabled = loading;
            if (loading) {
                this.chatSend.innerHTML = '<i class="fas fa-spinner fa-spin text-xs"></i>';
            } else {
                this.chatSend.innerHTML = '<i class="fas fa-paper-plane text-xs"></i>';
            }
        }
    }
}

// ── Visual Agent Mode Dashboard Control ──
function setupAgentModeDashboard() {
    const toggleBtn = document.getElementById('agent-mode-toggle');
    const overlay = document.getElementById('agent-mode-overlay');
    const closeBtn = document.getElementById('close-agent-mode');
    const copyBtn = document.getElementById('copy-prompt-btn');
    const promptText = document.getElementById('agent-prompt-text');

    if (!toggleBtn || !overlay) return;

    // The overlay is a modal dialog. Before this it was a div that appeared:
    // focus never entered it, the eight controls behind it stayed tabbable and
    // invisible, Escape did nothing, and the only way out was a mouse click on
    // the backdrop or a 20x25px close button. Keyboard and screen-reader users
    // were simply stuck.
    const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    let lastFocused = null;

    const focusablesIn = () =>
        [...overlay.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);

    const showOverlay = () => {
        lastFocused = document.activeElement;
        overlay.classList.remove('hidden');
        document.body.classList.add('overflow-hidden'); // Block page scroll
        toggleBtn.setAttribute('aria-expanded', 'true');
        // Land on the panel itself rather than the close button, so a screen
        // reader announces the dialog and its title before its first control.
        overlay.focus({ preventScroll: true });
    };

    const hideOverlay = () => {
        overlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        toggleBtn.setAttribute('aria-expanded', 'false');
        // Return focus where it came from; otherwise it falls to <body> and the
        // next Tab restarts at the top of the page.
        (lastFocused || toggleBtn).focus({ preventScroll: true });
        lastFocused = null;
    };

    const isOpen = () => !overlay.classList.contains('hidden');

    toggleBtn.addEventListener('click', showOverlay);
    closeBtn?.addEventListener('click', hideOverlay);

    // Close on clicking overlay background
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) hideOverlay();
    });

    document.addEventListener('keydown', (e) => {
        if (!isOpen()) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            hideOverlay();
            return;
        }

        if (e.key !== 'Tab') return;

        // Trap: cycle within the dialog instead of walking the page behind it.
        const items = focusablesIn();
        if (!items.length) { e.preventDefault(); return; }
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;

        if (!overlay.contains(active)) {
            e.preventDefault();
            (e.shiftKey ? last : first).focus();
        } else if (e.shiftKey && active === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && active === last) {
            e.preventDefault();
            first.focus();
        }
    });

    // Copy Prompt to Clipboard
    copyBtn?.addEventListener('click', () => {
        if (promptText) {
            promptText.select();
            promptText.setSelectionRange(0, 99999); // Mobile compatibility
            
            try {
                navigator.clipboard.writeText(promptText.value);
                showNotification('Agent System Prompt copied to clipboard!', 'success');
            } catch (err) {
                // Fallback command
                document.execCommand('copy');
                showNotification('Agent System Prompt copied to clipboard!', 'success');
            }
        }
    });
}

/* ══════════════════════════════════════════════════════════════════
   CLOSING PIECE — playable warp scheduler
   The canvas is a pointer enhancement. The Dispatch button does the same
   thing from a keyboard, and the readout is real text in an aria-live
   region, so nothing here is pointer-only or canvas-only.
   ══════════════════════════════════════════════════════════════════ */
function setupScheduler() {
    const canvas = document.getElementById('scheduler-canvas');
    const stage = canvas && canvas.parentElement;
    if (!canvas || !stage) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    const btn = document.getElementById('scheduler-dispatch');
    const outBlocks = document.getElementById('sched-blocks');
    const outWarps = document.getElementById('sched-warps');
    const outPeak = document.getElementById('sched-peak');
    const punchline = document.getElementById('scheduler-punchline');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Deliberately few, large SMs. A physically honest 56-SM array meant one
    // dispatch moved peak occupancy by 3% and the interaction felt inert —
    // legibility of the mechanic beats fidelity of the part count here.
    const SLOT = 24, GAP = 6, SM_COLS = 4, SM_ROWS = 4, SM_GAP = 28;
    const SM_W = SM_COLS * SLOT + (SM_COLS - 1) * GAP;
    const SM_H = SM_ROWS * SLOT + (SM_ROWS - 1) * GAP;

    let W = 0, H = 0, sms = [], running = false, raf = 0;
    let blocks = 0, warps = 0, peak = 0;

    function ink() {
        return document.documentElement.classList.contains('dark') ? '255, 255, 255' : '17, 17, 17';
    }

    function build() {
        const r = stage.getBoundingClientRect();
        W = Math.max(1, Math.floor(r.width));
        H = Math.max(1, Math.floor(r.height));
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(W * dpr);
        canvas.height = Math.floor(H * dpr);
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        sms = [];
        const stepX = SM_W + SM_GAP, stepY = SM_H + SM_GAP;
        const cols = Math.max(1, Math.floor((W + SM_GAP) / stepX));
        const rows = Math.max(1, Math.floor((H + SM_GAP) / stepY));
        const offX = (W - (cols * stepX - SM_GAP)) / 2;
        const offY = (H - (rows * stepY - SM_GAP)) / 2;
        for (let r2 = 0; r2 < rows; r2++) {
            for (let c = 0; c < cols; c++) {
                const slots = [];
                for (let i = 0; i < SM_COLS * SM_ROWS; i++) slots.push({ load: 0, target: 0, until: 0, counted: false });
                sms.push({ x: offX + c * stepX, y: offY + r2 * stepY, slots, flash: 0 });
            }
        }
    }

    // Dispatch into the SM nearest the point, spilling to neighbours when it
    // saturates — which is the whole lesson the piece is trying to hand over.
    function dispatch(px, py) {
        if (!sms.length) return;
        let order = sms.map((sm, i) => {
            const dx = sm.x + SM_W / 2 - px;
            const dy = sm.y + SM_H / 2 - py;
            return { i, d: Math.sqrt(dx * dx + dy * dy) };
        }).sort((a, b) => a.d - b.d);

        let want = 10 + Math.floor(Math.random() * 10);
        const now = performance.now();
        for (const { i } of order) {
            if (want <= 0) break;
            const sm = sms[i];
            let placed = 0;
            for (const s of sm.slots) {
                if (want <= 0) break;
                if (s.target === 0) {
                    s.target = 0.66 + Math.random() * 0.34;
                    s.until = now + 1100 + Math.random() * 1900;
                    s.counted = false;
                    want--; placed++;
                }
            }
            if (placed) sm.flash = 1;
        }
        blocks++;
        if (outBlocks) outBlocks.textContent = String(blocks);
        if (blocks >= 5 && punchline && punchline.hidden) punchline.hidden = false;
        start();
    }

    function step(now) {
        let occNow = 0, total = 0;
        for (const sm of sms) {
            sm.flash *= 0.9;
            for (const s of sm.slots) {
                if (s.target > 0 && now > s.until) {
                    s.target = 0;
                    if (!s.counted) { s.counted = true; warps++; }
                }
                const rate = s.target > s.load ? 0.17 : 0.04;
                s.load += (s.target - s.load) * rate;
                if (s.load < 0.004) s.load = 0;
                occNow += s.load; total++;
            }
        }
        const pct = total ? Math.round((occNow / total) * 100) : 0;
        if (pct > peak) { peak = pct; if (outPeak) outPeak.textContent = peak + '%'; }
        if (outWarps) outWarps.textContent = String(warps);
        return occNow > 0.01;
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        const rgb = ink();
        for (const sm of sms) {
            let occ = 0;
            for (const s of sm.slots) occ += s.load;
            occ /= sm.slots.length;

            if (occ > 0.02 || sm.flash > 0.02) {
                ctx.strokeStyle = `rgba(${rgb}, ${0.05 + occ * 0.16 + sm.flash * 0.3})`;
                ctx.lineWidth = 1;
                ctx.strokeRect(Math.round(sm.x) - 4.5, Math.round(sm.y) - 4.5, SM_W + 9, SM_H + 9);
            }
            for (let i = 0; i < sm.slots.length; i++) {
                const s = sm.slots[i];
                const sx = sm.x + (i % SM_COLS) * (SLOT + GAP);
                const sy = sm.y + Math.floor(i / SM_COLS) * (SLOT + GAP);
                ctx.fillStyle = s.load < 0.01
                    ? `rgba(${rgb}, 0.05)`
                    : `rgba(${rgb}, ${0.08 + s.load * 0.86})`;
                ctx.fillRect(sx, sy, SLOT, SLOT);
            }
        }
    }

    function frame(now) {
        const alive = step(now);
        draw();
        if (alive && running) raf = requestAnimationFrame(frame);
        else { running = false; draw(); }
    }

    function start() {
        if (running) return;
        if (reduced.matches) { step(performance.now() + 4000); draw(); return; }
        running = true;
        raf = requestAnimationFrame(frame);
    }

    canvas.addEventListener('pointerdown', (e) => {
        const r = canvas.getBoundingClientRect();
        dispatch(e.clientX - r.left, e.clientY - r.top);
    });
    canvas.addEventListener('pointermove', (e) => {
        if (e.buttons !== 1) return;
        const r = canvas.getBoundingClientRect();
        dispatch(e.clientX - r.left, e.clientY - r.top);
    });
    btn?.addEventListener('click', () => dispatch(W * Math.random(), H * Math.random()));

    window.addEventListener('resize', () => { build(); draw(); }, { passive: true });
    build();
    draw();
}

/* ══════════════════════════════════════════════════════════════════
   SECTION MOTION — three systems, each one-way and fail-visible.
   Resting state is always the finished state; the observer adds a class to
   replay arrival. If JS or the observer never runs, the page is simply
   already there rather than blank — the failure mode that hid five of seven
   job cards before.
   ══════════════════════════════════════════════════════════════════ */
function setupSectionMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add('is-in');
            io.unobserve(e.target);
        });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    // 1. Section rules draw ink over their existing hairline track.
    document.querySelectorAll('main section > h2').forEach((h2) => {
        h2.classList.add('rule-draw');
        io.observe(h2);
    });

    // 2. Cards arrive in a light stagger — but only the ones actually below
    // the fold get hidden first. Hiding a card that is already on screen buys
    // a flash and nothing else, and hiding one that never gets observed is how
    // content disappears.
    const fold = window.innerHeight * 0.9;
    let staggerIndex = 0;
    document.querySelectorAll('#projects-grid > div').forEach((card) => {
        if (card.getBoundingClientRect().top <= fold) return;
        card.classList.add('card-rise');
        card.style.setProperty('--rise-delay', (staggerIndex++ % 4) * 70 + 'ms');
        io.observe(card);
    });

    // Failsafe: whatever is still hidden after four seconds gets shown. No
    // observer bug, scroll anchor, or restored session should be able to leave
    // a project card blank.
    setTimeout(() => {
        document.querySelectorAll('.card-rise:not(.is-in)').forEach((el) => el.classList.add('is-in'));
    }, 4000);

    // 3. Metric callouts count to their value.
    const counters = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            countUp(e.target);
            counters.unobserve(e.target);
        });
    }, { threshold: 0.6 });
    document.querySelectorAll('.proj-metric__value').forEach((el) => counters.observe(el));
}

// Animates the leading number(s) of a metric, leaving units and suffixes
// alone. Ranges ("79–83") advance together so the label never reads as a
// contradiction mid-count. Tabular figures mean the box never reflows.
function countUp(el) {
    const node = [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    if (!node) return;
    const raw = node.textContent;
    const m = raw.match(/^(\s*)(\d+(?:\.\d+)?)(\s*[–—-]\s*(\d+(?:\.\d+)?))?(.*)$/s);
    if (!m) return;

    const [, lead, aStr, rangeSep, bStr, tail] = m;
    const a = parseFloat(aStr);
    const b = bStr !== undefined ? parseFloat(bStr) : null;
    const decimals = (aStr.split('.')[1] || '').length;
    const fmt = (v) => v.toFixed(decimals);

    const dur = 900;
    const t0 = performance.now();
    function tick(now) {
        const p = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3); // ease-out cubic
        let out = lead + fmt(a * e);
        if (b !== null) out += rangeSep.replace(/\d+(?:\.\d+)?/, '') + fmt(b * e);
        node.textContent = out + tail;
        if (p < 1) requestAnimationFrame(tick);
        else node.textContent = raw;
    }
    node.textContent = lead + fmt(0) + (b !== null ? rangeSep.replace(/\d+(?:\.\d+)?/, '') + fmt(0) : '') + tail;
    requestAnimationFrame(tick);
}
