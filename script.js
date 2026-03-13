// Theme handling
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
        // ignore storage errors
    }
}

function getCurrentTheme() {
    const stored = getStoredTheme();
    if (stored === 'light' || stored === 'dark') {
        return stored;
    }
    // Default to dark if nothing stored
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
                moonIcon.classList.remove('hidden');
                sunIcon.classList.add('hidden');
            } else {
                moonIcon.classList.add('hidden');
                sunIcon.classList.remove('hidden');
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

// Mobile Navigation Toggle and page setup
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    setupThemeToggle();

    const hamburger = document.querySelector('.md\\:hidden');
    const navMenu = document.querySelector('ul');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('hidden');
            navMenu.classList.toggle('flex');
            navMenu.classList.toggle('flex-col');
            navMenu.classList.toggle('absolute');
            navMenu.classList.toggle('top-full');
            navMenu.classList.toggle('left-0');
            navMenu.classList.toggle('w-full');
            const isDarkMode = document.documentElement.classList.contains('dark');
            navMenu.classList.toggle(isDarkMode ? 'bg-black' : 'bg-white');
            navMenu.classList.toggle('shadow-lg');
            navMenu.classList.toggle('p-4');
            navMenu.classList.toggle('space-y-4');
        });
    }

    // Newsletter form handling
    const newsletterForm = document.querySelector('form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            if (email) {
                // Show success message
                showNotification('Thank you for subscribing!', 'success');
                this.reset();
            }
        });
    }

    // Contact form handling with EmailJS
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // Initialize EmailJS
        emailjs.init("pD3wkchfGF0LDwUTX");

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            
            // Show loading state
            btnText.classList.add('hidden');
            btnLoading.classList.remove('hidden');
            submitBtn.disabled = true;
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            // Send email using EmailJS
            emailjs.send('service_7rphve8', 'template_7iwzlui', {
                from_name: formData.name,
                from_email: formData.email,
                subject: formData.subject,
                message: formData.message
            })
            .then(function(response) {
                showNotification('Message sent successfully!', 'success');
                contactForm.reset();
            })
            .catch(function(error) {
                showNotification('Failed to send message. Please try again.', 'error');
            })
            .finally(function() {
                // Reset button state
                btnText.classList.remove('hidden');
                btnLoading.classList.add('hidden');
                submitBtn.disabled = false;
            });
        });
    }
});

// Notification system
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification fixed top-20 right-5 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    
    // Set notification styles based on type
    if (type === 'success') {
        notification.classList.add('bg-green-500', 'text-white');
    } else if (type === 'error') {
        notification.classList.add('bg-red-500', 'text-white');
    }
    
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Update Substack URL function
function updateSubstackURL() {
    const substackLink = document.getElementById('substackLink');
    if (substackLink) {
        substackLink.href = 'https://ramshankar07.substack.com/?r=1rtqqj&utm_campaign=pub-share-checklist';
    }
}

// Smooth scrolling for anchor links (if needed)
function smoothScrollTo(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Add scroll event listener for navbar background
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('nav');
    if (navbar) {
        const isDark = document.documentElement.classList.contains('dark');
        if (window.scrollY > 50) {
            navbar.classList.add(isDark ? 'bg-black' : 'bg-white');
            navbar.classList.remove(isDark ? 'bg-black/80' : 'bg-white/95');
        } else {
            navbar.classList.remove(isDark ? 'bg-black' : 'bg-white');
            navbar.classList.add(isDark ? 'bg-black/80' : 'bg-white/95');
        }
    }
});

// Chatbot functionality
class PortfolioChatbot {
    constructor() {
        this.apiUrl = 'https://portfolio-chatbot-staging.picographer0214.workers.dev';
        this.isOpen = false;
        this.isLoading = false;
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.chatToggle = document.getElementById('chat-toggle');
        this.chatInterface = document.getElementById('chat-interface');
        this.chatClose = document.getElementById('chat-close');
        this.chatInput = document.getElementById('chat-input');
        this.chatSend = document.getElementById('chat-send');
        this.chatMessages = document.getElementById('chat-messages');
        this.chatArrow = document.getElementById('chat-arrow');
    }

    bindEvents() {
        // Send message
        this.chatSend?.addEventListener('click', () => this.sendMessage());
        this.chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-focus input on page load
        setTimeout(() => {
            this.chatInput?.focus();
        }, 500);
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            this.chatInterface?.classList.remove('hidden');
            this.chatArrow?.classList.remove('fa-chevron-up');
            this.chatArrow?.classList.add('fa-chevron-down');
        } else {
            this.chatInterface?.classList.add('hidden');
            this.chatArrow?.classList.remove('fa-chevron-down');
            this.chatArrow?.classList.add('fa-chevron-up');
        }
    }

    closeChat() {
        this.isOpen = false;
        this.chatInterface?.classList.add('hidden');
        this.chatArrow?.classList.remove('fa-chevron-down');
        this.chatArrow?.classList.add('fa-chevron-up');
    }

    async sendMessage() {
        const message = this.chatInput?.value.trim();
        if (!message || this.isLoading) return;

        // Show loading state
        this.setLoading(true);
        
        try {
            const response = await fetch(`${this.apiUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    useGemini: true
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Show result in a modal or alert
            this.showResult(data.response);
            this.chatInput.value = '';
            
        } catch (error) {
            console.error('Chat error:', error);
            this.showResult('Sorry, I encountered an error. Please try again later.');
        } finally {
            this.setLoading(false);
        }
    }

    showResult(message) {
        // Create or update result modal
        let resultModal = document.getElementById('search-result-modal');
        
        if (!resultModal) {
            resultModal = document.createElement('div');
            resultModal.id = 'search-result-modal';
            resultModal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
            document.body.appendChild(resultModal);
        }

        const isDarkTheme = document.documentElement.classList.contains('dark');
        const accentFrom = isDarkTheme ? '#00FF41' : '#3b82f6';
        const accentTo = isDarkTheme ? '#00CC33' : '#2563eb';
        const borderClr = isDarkTheme ? '#00FF41' : '#60a5fa';
        resultModal.innerHTML = `
            <div class="bg-gray-900 border-2 rounded-2xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto shadow-2xl" style="border-color:${borderClr};">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg" style="background:linear-gradient(to right,${accentFrom},${accentTo});">
                            <i class="fas fa-search text-white text-sm"></i>
                        </div>
                        <h3 class="text-white text-lg font-semibold">Search Result</h3>
                    </div>
                    <button id="close-result" class="text-gray-400 hover:text-white transition-colors">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="text-gray-300 leading-relaxed whitespace-pre-wrap">${message}</div>
            </div>
        `;

        // Show modal
        resultModal.classList.remove('hidden');
        
        // Close modal events
        document.getElementById('close-result')?.addEventListener('click', () => {
            resultModal.classList.add('hidden');
        });
        
        resultModal.addEventListener('click', (e) => {
            if (e.target === resultModal) {
                resultModal.classList.add('hidden');
            }
        });

        // Auto-focus back to input
        setTimeout(() => {
            this.chatInput?.focus();
        }, 100);
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex items-start space-x-3 ${sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`;
        
        const avatarDiv = document.createElement('div');
        const isDarkAvatar = document.documentElement.classList.contains('dark');
        const botGradient = isDarkAvatar ? 'from-green-500 to-green-600' : 'from-blue-500 to-blue-600';
        avatarDiv.className = `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
            sender === 'user'
                ? 'bg-gradient-to-r from-gray-500 to-gray-600'
                : `bg-gradient-to-r ${botGradient}`
        }`;
        
        const avatarIcon = document.createElement('i');
        avatarIcon.className = sender === 'user' ? 'fas fa-user text-white text-sm' : 'fas fa-search text-white text-sm';
        avatarDiv.appendChild(avatarIcon);
        
        const messageContent = document.createElement('div');
        messageContent.className = `backdrop-blur-md rounded-2xl p-3 max-w-xs shadow-lg ${
            sender === 'user' 
                ? 'bg-white/30 rounded-tr-sm' 
                : 'bg-white/20 rounded-tl-sm'
        }`;
        
        const messageText = document.createElement('p');
        messageText.className = 'text-gray-700 text-sm';
        messageText.textContent = content;
        messageContent.appendChild(messageText);
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(messageContent);
        
        this.chatMessages?.appendChild(messageDiv);
        
        // Scroll to bottom
        this.chatMessages?.scrollTo({
            top: this.chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }

    setLoading(loading) {
        this.isLoading = loading;
        this.chatSend.disabled = loading;
        
        if (loading) {
            this.chatSend.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        } else {
            this.chatSend.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    }

    addTypingIndicator() {
        const typingId = 'typing-' + Date.now();
        const messageDiv = document.createElement('div');
        messageDiv.id = typingId;
        messageDiv.className = 'flex items-start space-x-3';
        
        const avatarDiv = document.createElement('div');
        const isDarkTyping = document.documentElement.classList.contains('dark');
        const typingGradient = isDarkTyping ? 'from-green-500 to-green-600' : 'from-blue-500 to-blue-600';
        avatarDiv.className = `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r ${typingGradient} shadow-lg`;
        
        const avatarIcon = document.createElement('i');
        avatarIcon.className = 'fas fa-search text-white text-sm';
        avatarDiv.appendChild(avatarIcon);
        
        const messageContent = document.createElement('div');
        messageContent.className = 'backdrop-blur-md rounded-2xl rounded-tl-sm p-3 max-w-xs bg-white/20';
        
        const typingContainer = document.createElement('div');
        typingContainer.className = 'flex space-x-1';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-indicator';
            typingContainer.appendChild(dot);
        }
        
        messageContent.appendChild(typingContainer);
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(messageContent);
        
        this.chatMessages?.appendChild(messageDiv);
        
        // Scroll to bottom
        this.chatMessages?.scrollTo({
            top: this.chatMessages.scrollHeight,
            behavior: 'smooth'
        });
        
        return typingId;
    }

    removeTypingIndicator(typingId) {
        const typingElement = document.getElementById(typingId);
        if (typingElement) {
            typingElement.remove();
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize functions when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateSubstackURL();
    
    // Initialize chatbot
    new PortfolioChatbot();
});
