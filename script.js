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
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('#nav-links a');

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
});

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
        
        // Auto focus search widget on initial load
        setTimeout(() => {
            this.chatInput?.focus();
        }, 600);
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
            this.chatInput?.focus();
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

    // Toggle Overlay Visible
    toggleBtn.addEventListener('click', () => {
        overlay.classList.remove('hidden');
        document.body.classList.add('overflow-hidden'); // Block page scroll
    });

    const hideOverlay = () => {
        overlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    };

    closeBtn?.addEventListener('click', hideOverlay);
    
    // Close on clicking overlay background
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) hideOverlay();
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
