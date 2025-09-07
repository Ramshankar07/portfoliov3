// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
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
            navMenu.classList.toggle('bg-white');
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
        if (window.scrollY > 50) {
            navbar.classList.add('bg-white');
            navbar.classList.remove('bg-white/95');
        } else {
            navbar.classList.remove('bg-white');
            navbar.classList.add('bg-white/95');
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
        // Toggle chat interface
        this.chatToggle?.addEventListener('click', () => this.toggleChat());
        this.chatClose?.addEventListener('click', () => this.closeChat());
        
        // Send message
        this.chatSend?.addEventListener('click', () => this.sendMessage());
        this.chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-focus input when chat opens
        this.chatToggle?.addEventListener('click', () => {
            setTimeout(() => {
                this.chatInput?.focus();
            }, 300);
        });
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

        // Add user message to chat
        this.addMessage(message, 'user');
        this.chatInput.value = '';
        
        // Show loading state
        this.setLoading(true);
        
        // Add typing indicator
        const typingId = this.addTypingIndicator();
        
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
            
            // Remove typing indicator
            this.removeTypingIndicator(typingId);
            
            // Simulate typing delay
            await this.delay(data.delay || 1000);
            
            // Add bot response
            this.addMessage(data.response, 'bot');
            
        } catch (error) {
            console.error('Chat error:', error);
            this.removeTypingIndicator(typingId);
            this.addMessage('Sorry, I encountered an error. Please try again later.', 'bot');
        } finally {
            this.setLoading(false);
        }
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex items-start space-x-3 ${sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            sender === 'user' 
                ? 'bg-gradient-to-r from-gray-500 to-gray-600' 
                : 'bg-gradient-to-r from-primary-500 to-primary-600'
        }`;
        
        const avatarIcon = document.createElement('i');
        avatarIcon.className = sender === 'user' ? 'fas fa-user text-white text-sm' : 'fas fa-robot text-white text-sm';
        avatarDiv.appendChild(avatarIcon);
        
        const messageContent = document.createElement('div');
        messageContent.className = `backdrop-blur-md rounded-2xl p-3 max-w-xs ${
            sender === 'user' 
                ? 'bg-white/30 rounded-tr-sm' 
                : 'bg-white/20 rounded-tl-sm'
        }`;
        
        const messageText = document.createElement('p');
        messageText.className = 'text-white text-sm';
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
        avatarDiv.className = 'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-primary-500 to-primary-600';
        
        const avatarIcon = document.createElement('i');
        avatarIcon.className = 'fas fa-robot text-white text-sm';
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
