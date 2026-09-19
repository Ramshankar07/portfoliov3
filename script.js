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
    setupDiemark();
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

/* ══════════════════════════════════════════════════════════════════
   CLOSING PIECE — MI300X package, rendered in ASCII
   A real 3D render, not a glyph collage: boxes are rotated, projected,
   depth-sorted and shaded by a lambert term into an offscreen buffer, then
   that buffer is sampled per character cell and mapped through a density
   ramp. Shading comes from the geometry, which is why it reads as a solid
   object rather than a pattern.

   Modelled on the MI300X layout because that is the board the 12.1 ms/token
   figure was measured on: one compute die with eight HBM stacks around it.
   ══════════════════════════════════════════════════════════════════ */
function setupDiemark() {
    const canvas = document.getElementById('diemark-canvas');
    const stage = canvas && canvas.parentElement;
    if (!canvas || !stage) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    const buf = document.createElement('canvas');
    const bctx = buf.getContext('2d', { alpha: false, willReadFrequently: true });
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = window.matchMedia('(pointer: coarse)');

    // Dense → sparse. The ramp is the shading; alpha only trims the extremes.
    const RAMP = '@%#*+=-:. ';
    // Fine cells matter more than they look: `rows` binds the render scale,
    // and at 12px rows a 460px stage gave only 38 of them, which capped the
    // object at a third of the frame.
    const CELL_W = 6, CELL_H = 10;

    let W = 0, H = 0, cols = 0, rows = 0;
    let yaw = -0.62, pitch = -0.68, tYaw = -0.62, tPitch = -0.68;
    let raf = 0, running = false, visible = false, idle = 0;

    // ── Model. Units are arbitrary; the package is ~1 unit deep. ──────────
    // MI300X: a square-ish substrate, a central compute die, and eight HBM
    // stacks in two rows of four flanking it.
    const boxes = [];
    const box = (x, y, z, w, h, d, tone) => boxes.push({ x, y, z, w, h, d, tone });

    // The package, not the board. An earlier pass modelled the whole card and
    // the PCB slab swallowed the frame — the substrate, die and HBM ring are
    // the subject the copy actually describes, so everything else is gone.
    // +y is down here.
    box(0, 0.42, 0, 4.3, 0.26, 3.6, 0.30);           // substrate
    box(0, -0.06, 0, 1.45, 0.70, 2.45, 1.0);         // compute die
    for (let i = 0; i < 4; i++) {
        const z = -1.32 + i * 0.88;
        box(-1.52, 0.02, z, 0.82, 0.55, 0.72, 0.62); // HBM, left rank
        box(1.52, 0.02, z, 0.82, 0.55, 0.72, 0.62);  // HBM, right rank
    }

    const FACES = [
        [[0,1,2,3], [0,-1,0]], [[4,7,6,5], [0,1,0]],
        [[0,4,5,1], [0,0,-1]], [[3,2,6,7], [0,0,1]],
        [[0,3,7,4], [-1,0,0]], [[1,5,6,2], [1,0,0]]
    ];

    function verts(b) {
        const hw = b.w / 2, hh = b.h / 2, hd = b.d / 2;
        return [
            [b.x-hw, b.y-hh, b.z-hd], [b.x+hw, b.y-hh, b.z-hd],
            [b.x+hw, b.y-hh, b.z+hd], [b.x-hw, b.y-hh, b.z+hd],
            [b.x-hw, b.y+hh, b.z-hd], [b.x+hw, b.y+hh, b.z-hd],
            [b.x+hw, b.y+hh, b.z+hd], [b.x-hw, b.y+hh, b.z+hd]
        ];
    }

    function rot(v, cy, sy, cp, sp) {
        const x = v[0] * cy - v[2] * sy;
        const z = v[0] * sy + v[2] * cy;
        const y = v[1] * cp - z * sp;
        return [x, y, z * cp + v[1] * sp];
    }

    function resize() {
        const r = stage.getBoundingClientRect();
        W = Math.max(1, Math.floor(r.width));
        H = Math.max(1, Math.floor(r.height));
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(W * dpr);
        canvas.height = Math.floor(H * dpr);
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cols = Math.max(8, Math.floor(W / CELL_W));
        rows = Math.max(6, Math.floor(H / CELL_H));
        buf.width = cols;
        buf.height = rows;
    }

    function draw() {
        const cy = Math.cos(yaw), sy = Math.sin(yaw);
        const cp = Math.cos(pitch), sp = Math.sin(pitch);
        const ASPECT = (CELL_W / CELL_H) * 1.95;

        // Project once in model units, then fit the result to the frame. Hand
        // tuned scale constants kept going wrong because the projected extent
        // changes as the object rotates; measuring it instead keeps the render
        // centred and filled at every angle.
        const raw = [];
        for (const b of boxes) {
            const vs = verts(b).map(v => rot(v, cy, sy, cp, sp));
            for (const [idx, n] of FACES) {
                const nr = rot(n, cy, sy, cp, sp);
                if (nr[2] > 0.02) continue;                       // back-face cull
                const lam = Math.max(0, -nr[2]) * 0.55 + Math.max(0, -nr[1]) * 0.45;
                const pts = idx.map((k) => {
                    const v = vs[k];
                    const persp = 1 / (1 + (v[2] + 7) * 0.04);
                    return [v[0] * persp, v[1] * persp * ASPECT];
                });
                raw.push({
                    pts,
                    depth: idx.reduce((a, k) => a + vs[k][2], 0) / 4,
                    shade: Math.min(1, 0.2 + lam * (0.3 + b.tone * 1.15) * 1.45)
                });
            }
        }
        if (!raw.length) return;

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const f of raw) for (const pt of f.pts) {
            if (pt[0] < minX) minX = pt[0];
            if (pt[0] > maxX) maxX = pt[0];
            if (pt[1] < minY) minY = pt[1];
            if (pt[1] > maxY) maxY = pt[1];
        }
        const fit = Math.min((cols * 0.94) / (maxX - minX), (rows * 0.92) / (maxY - minY));
        const ox = cols / 2 - ((minX + maxX) / 2) * fit;
        const oy = rows / 2 - ((minY + maxY) / 2) * fit;

        bctx.fillStyle = '#000';
        bctx.fillRect(0, 0, cols, rows);
        raw.sort((a, b2) => b2.depth - a.depth);                  // painter's algorithm

        for (const f of raw) {
            const g = Math.round(f.shade * 255);
            bctx.fillStyle = `rgb(${g},${g},${g})`;
            bctx.beginPath();
            bctx.moveTo(ox + f.pts[0][0] * fit, oy + f.pts[0][1] * fit);
            for (let k = 1; k < f.pts.length; k++) bctx.lineTo(ox + f.pts[k][0] * fit, oy + f.pts[k][1] * fit);
            bctx.closePath();
            bctx.fill();
        }

        const data = bctx.getImageData(0, 0, cols, rows).data;
        const dark = document.documentElement.classList.contains('dark');
        ctx.clearRect(0, 0, W, H);
        ctx.font = `${CELL_H - 1}px "Courier New", ui-monospace, monospace`;
        ctx.textBaseline = 'top';

        const padX = (W - cols * CELL_W) / 2;
        const padY = (H - rows * CELL_H) / 2;

        for (let r2 = 0; r2 < rows; r2++) {
            for (let c = 0; c < cols; c++) {
                const lum = data[(r2 * cols + c) * 4] / 255;
                if (lum < 0.06) continue;
                const ch = RAMP[Math.min(RAMP.length - 1, Math.floor((1 - lum) * (RAMP.length - 1)))];
                if (ch === ' ') continue;
                ctx.fillStyle = dark
                    ? `rgba(245, 245, 247, ${0.3 + lum * 0.7})`
                    : `rgba(17, 17, 17, ${0.28 + lum * 0.72})`;
                ctx.fillText(ch, padX + c * CELL_W, padY + r2 * CELL_H);
            }
        }
    }

    function frame() {
        // Ease toward the cursor target; drift slowly when nothing is driving it.
        if (coarse.matches || idle > 90) tYaw += 0.0045;
        yaw += (tYaw - yaw) * 0.06;
        pitch += (tPitch - pitch) * 0.06;
        idle++;
        draw();
        if (running) raf = requestAnimationFrame(frame);
    }

    function start() {
        if (running || reduced.matches) return;
        running = true;
        raf = requestAnimationFrame(frame);
    }
    function stop() { running = false; cancelAnimationFrame(raf); }

    window.addEventListener('pointermove', (e) => {
        const r = stage.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        tYaw = -0.62 + ((e.clientX / window.innerWidth) - 0.5) * 2.4;
        tPitch = -0.68 + ((e.clientY / window.innerHeight) - 0.5) * 0.55;
        idle = 0;
    }, { passive: true });

    window.addEventListener('resize', () => { resize(); draw(); }, { passive: true });

    resize();
    draw();

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            visible = entries[0].isIntersecting;
            if (visible) { stage.classList.add('is-in'); if (!document.hidden) start(); }
            else stop();
        }, { threshold: 0.08 });
        io.observe(stage);
    } else {
        stage.classList.add('is-in');
        start();
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else if (visible) start();
    });

    reduced.addEventListener('change', (e) => {
        if (e.matches) { stop(); draw(); } else if (visible) start();
    });
}
