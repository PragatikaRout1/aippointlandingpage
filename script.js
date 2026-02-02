// ============================================
// GLOBAL FUNCTIONS FOR INLINE ONCLICK HANDLERS
// ============================================

// Make functions globally accessible
window.openCalendarModal = function() {
    openBookingModal();
};

window.closeCalendarModal = function() {
    closeBookingModal();
};

window.handleSetupSubmit = function() {
    // Get submit button
    const submitBtn = document.getElementById('setupSubmitBtn');
    const emailInput = document.getElementById('setupEmail');
    const companyNameInput = document.getElementById('setupCompanyName');
    const countrySelect = document.getElementById('setupCountry');
    
    // Get selected values using the helper function
    const getSelectedButton = (groupName) => {
        return document.querySelector(`.option-btn[data-group="${groupName}"].selected`);
    };
    
    const hiresSelected = getSelectedButton('hires');
    const focusSelect = document.getElementById('focusSelect');
    const focusValue = focusSelect ? focusSelect.value : '';
    const emailValue = emailInput ? emailInput.value.trim() : '';
    const companyNameValue = companyNameInput ? companyNameInput.value.trim() : '';
    const countryValue = countrySelect ? countrySelect.value : '';
    
    // Validate selections
    const hiresValidation = document.getElementById('hiresValidation');
    const focusValidation = document.getElementById('focusValidation');
    const emailValidation = document.getElementById('emailValidation');
    const companyNameValidation = document.getElementById('companyNameValidation');
    const countryValidation = document.getElementById('countryValidation');
    
    // Clear previous validation errors
    if (hiresValidation) {
        hiresValidation.style.display = 'none';
        hiresValidation.textContent = '';
        hiresValidation.classList.remove('error');
    }
    if (focusValidation) {
        focusValidation.style.display = 'none';
        focusValidation.textContent = '';
        focusValidation.classList.remove('error');
    }
    if (emailValidation) {
        emailValidation.style.display = 'none';
        emailValidation.textContent = '';
        emailValidation.classList.remove('error');
    }
    if (companyNameValidation) {
        companyNameValidation.style.display = 'none';
        companyNameValidation.textContent = '';
        companyNameValidation.classList.remove('error');
    }
    if (countryValidation) {
        countryValidation.style.display = 'none';
        countryValidation.textContent = '';
        countryValidation.classList.remove('error');
    }
    
    // Remove error states from buttons and inputs
    const allButtons = document.querySelectorAll('.option-btn');
    allButtons.forEach(btn => {
        btn.classList.remove('error-state');
    });
    
    if (companyNameInput) {
        companyNameInput.classList.remove('error-state');
        companyNameInput.style.borderColor = '';
    }
    if (countrySelect) {
        countrySelect.classList.remove('error-state');
        countrySelect.style.borderColor = '';
    }
    if (focusSelect) {
        focusSelect.classList.remove('error-state');
        focusSelect.style.borderColor = '';
    }
    
    let isValid = true;
    
    // Check hires selection
    if (!hiresSelected) {
        if (hiresValidation) {
            hiresValidation.style.display = 'block';
            hiresValidation.textContent = 'Please select how many hires you make per year';
            hiresValidation.classList.add('error');
        }
        isValid = false;
        
        // Highlight the buttons in the 'hires' group with error state
        const hiresButtons = document.querySelectorAll('.option-btn[data-group="hires"]');
        hiresButtons.forEach(btn => {
            if (!btn.classList.contains('selected')) {
                btn.classList.add('error-state');
            }
        });
    }
    
    // Check focus selection (dropdown)
    if (!focusValue) {
        if (focusValidation) {
            focusValidation.style.display = 'block';
            focusValidation.textContent = 'Please select your primary hiring focus';
            focusValidation.classList.add('error');
        }
        if (focusSelect) {
            focusSelect.classList.add('error-state');
            focusSelect.style.borderColor = 'rgba(239, 68, 68, 0.6)';
        }
        isValid = false;
    }
    
    // Check company name
    if (!companyNameValue || companyNameValue.length < 2) {
        if (companyNameValidation) {
            companyNameValidation.style.display = 'block';
            companyNameValidation.textContent = 'Please enter your company name';
            companyNameValidation.classList.add('error');
        }
        if (companyNameInput) {
            companyNameInput.classList.add('error-state');
            companyNameInput.style.borderColor = 'rgba(239, 68, 68, 0.6)';
        }
        isValid = false;
    }
    
    // Check country
    if (!countryValue) {
        if (countryValidation) {
            countryValidation.style.display = 'block';
            countryValidation.textContent = 'Please select your country';
            countryValidation.classList.add('error');
        }
        if (countrySelect) {
            countrySelect.classList.add('error-state');
            countrySelect.style.borderColor = 'rgba(239, 68, 68, 0.6)';
        }
        isValid = false;
    }
    
    // Check email
    if (!emailInput || !validateEmail(emailValue)) {
        if (emailValidation) {
            emailValidation.style.display = 'block';
            emailValidation.textContent = 'Please enter a valid work email';
            emailValidation.classList.add('error');
        }
        if (emailInput) {
            emailInput.classList.add('error-state');
            emailInput.style.borderColor = 'rgba(239, 68, 68, 0.6)';
        }
        isValid = false;
    }
    
    if (!isValid) {
        // Scroll to first error
        let firstError = null;
        if (!hiresSelected) firstError = hiresValidation;
        else if (!focusValue) firstError = focusValidation;
        else if (!companyNameValue) firstError = companyNameValidation;
        else if (!countryValue) firstError = countryValidation;
        else if (!emailValue || !validateEmail(emailValue)) firstError = emailValidation;
        
        if (firstError) {
            setTimeout(() => {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
        return;
    }
    
    // Form is valid - proceed with submission
    
    // 1. IMMEDIATE BUTTON FEEDBACK - Show loading state
    const originalButtonText = submitBtn.innerHTML;
    submitBtn.classList.add('loading');
    submitBtn.innerHTML = '<span class="button-spinner"></span> Finding your perfect plan…';
    
    // Get selected values
    const hiresValue = hiresSelected.getAttribute('data-value');
    // focusValue, companyNameValue, countryValue already defined above
    
    // 2. SAVE USER PREFERENCES to sessionStorage
    try {
        const userPreferences = {
            hiresPerYear: hiresValue,
            hiringFocus: focusValue,
            companyName: companyNameValue,
            country: countryValue,
            email: emailValue,
            timestamp: new Date().toISOString()
        };
        
        // Save to sessionStorage (temporary, cleared when browser closes)
        sessionStorage.setItem('AIPPoint_user_preferences', JSON.stringify(userPreferences));
        
        // Optional: Also save to localStorage for persistence across sessions
        localStorage.setItem('AIPPoint_user_preferences', JSON.stringify(userPreferences));
        
        // Optional: Send to backend API (commented out - uncomment when API is ready)
        fetch('http://127.0.0.1:3000/api/send-contact-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: companyNameValue,
                email: emailValue,
                company: companyNameValue,
                message: `Pricing inquiry - Hires: ${hiresValue}, Focus: ${focusValue}, Country: ${countryValue}`,
                formType: 'pricing',
                formData: {
                    hires: hiresValue,
                    focus: focusValue,
                    country: countryValue
                }
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Email sent:', data);
        })
        .catch(error => {
            console.error('Error sending email:', error);
        });
    } catch (error) {
        console.error('Error saving preferences:', error);
    }
    
    // 3. SIMULATE API CALL / Processing time (1-1.5 seconds for UX)
    setTimeout(() => {
        try {
            // Track the successful form submission (if tracking function exists)
            if (typeof trackEvent === 'function') {
                trackEvent('pricing_form_submitted', {
                    hires: hiresValue,
                    focus: focusValue,
                    companyName: companyNameValue,
                    country: countryValue
                });
            }

            // 4. OPEN EMAIL CAPTURE MODAL FOR TAILORED SETUP
            if (typeof openSetupEmailModal === 'function') {
                openSetupEmailModal();
            }

            // Reset button state
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = originalButtonText;
            
        } catch (error) {
            // 5. ERROR HANDLING - Re-enable button and show error message
            console.error('Error processing setup:', error);
            
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = originalButtonText;
            
            // Show error message to user
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.style.cssText = 'margin-top: 16px; padding: 12px 16px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; color: #fca5a5; font-size: 14px;';
            errorMessage.textContent = 'Something went wrong. Please try again.';
            
            const formCard = document.querySelector('.setup-form-card');
            if (formCard && !formCard.querySelector('.error-message')) {
                submitBtn.parentNode.insertBefore(errorMessage, submitBtn.nextSibling);
                
                // Remove error message after 5 seconds
                setTimeout(() => {
                    if (errorMessage.parentNode) {
                        errorMessage.remove();
                    }
                }, 5000);
            }
        }
    }, 1000); // 1 second delay for realistic processing feel
};

// ============================================
// FALLBACK CHATBOT FUNCTIONS (in case header hasn't loaded yet)
// ============================================
window.openChatbot = function() {
    console.log('Opening chatbot...');
    // Try to find the chatbot modal
    const modal = document.getElementById('chatbotModal');
    if (modal) {
        modal.setAttribute('aria-hidden', 'false');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            document.getElementById('chatbotInput')?.focus();
        }, 100);
    } else {
        console.log('Chatbot modal not found, header might still be loading...');
        // Wait a moment and try again
        setTimeout(() => {
            const retryModal = document.getElementById('chatbotModal');
            if (retryModal) {
                window.openChatbot();
            } else {
                console.error('Chatbot modal still not found');
            }
        }, 500);
    }
};

window.closeChatbot = function() {
    const modal = document.getElementById('chatbotModal');
    if (modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
};

// Fallback chatbot data and functions
const chatbotData = {
    "what is aippoint": "aippoint is an AI-powered interview assessment platform that helps companies screen candidates faster, assess skills accurately, and make data-driven hiring decisions. We use advanced AI to conduct interviews, evaluate candidates, and provide detailed insights.",
    "how does ai interview work": "Our AI interview system uses natural language processing and machine learning to conduct structured interviews. Candidates answer questions via video or text, and our AI analyzes their responses for technical skills, communication, problem-solving abilities, and cultural fit. The system provides detailed scorecards and recommendations.",
    "what are the pricing plans": "We offer flexible pricing plans based on your hiring volume. Plans range from Essentials (1-10 hires/year) to Enterprise (200+ hires/year). All plans include a 7-day free trial. Contact us for a tailored quote based on your specific needs.",
    "is it secure": "Yes, absolutely! aippoint is SOC 2 Type II certified, GDPR compliant, and follows enterprise-grade security standards. We encrypt all data in transit and at rest, implement strict access controls, and support SSO and audit logging.",
    "how accurate is the ai": "Our AI assessment system achieves 95% accuracy in skill evaluation, validated through extensive testing with over 1 million assessments. The system continuously learns and improves from each assessment.",
    "can i customize questions": "Yes! aippoint offers full customization of interview questions. You can create custom question sets, use our AI-generated questions based on job requirements, or import questions from your existing assessment library.",
    "what programming languages": "We support 50+ programming languages including Python, JavaScript, Java, C++, C#, Go, Ruby, PHP, Swift, Kotlin, and many more. Our platform also supports frameworks and libraries for comprehensive technical assessments.",
    "how does proctoring work": "Our advanced AI proctoring system uses computer vision and behavioral analysis to monitor assessments. It tracks screen activity, detects suspicious behavior, flags potential cheating attempts, and provides detailed proctoring reports while maintaining candidate privacy.",
    "free trial": "Yes! We offer a 7-day free trial with full access to all features. No credit card required. You can assess up to 50 candidates during the trial period to experience the full power of aippoint.",
    "ats integration": "Absolutely! aippoint integrates seamlessly with popular ATS platforms including Greenhouse, Lever, Workday, BambooHR, and many others. We also provide REST APIs for custom integrations with your existing systems.",
    "time to hire": "On average, our clients see a 60-70% reduction in time-to-hire. The AI-powered screening and assessment process eliminates manual resume review and speeds up candidate evaluation significantly.",
    "candidate experience": "Our platform provides an excellent candidate experience with user-friendly interfaces, clear instructions, and real-time feedback. Candidates can complete assessments at their convenience, and the AI interview process is designed to be engaging and fair.",
    "bias reduction": "Yes, our AI is specifically designed to reduce hiring bias. We use standardized evaluation criteria, focus on skills and competencies rather than demographics, and provide objective scoring that helps eliminate unconscious bias in the hiring process.",
    "support": "We offer comprehensive support including email support for all plans, priority support for Professional and Enterprise plans, and 24/7 support for Enterprise customers. We also provide dedicated account managers for Enterprise clients.",
    "setup time": "Getting started with aippoint is quick and easy. Most teams are up and running within 24-48 hours. We provide onboarding assistance, training materials, and can help with custom integrations if needed."
};

window.sendChatbotMessage = function(message) {
    if (!message || !message.trim()) return;
    
    const messagesContainer = document.getElementById('chatbotMessages');
    const suggestionsContainer = document.getElementById('chatbotSuggestions');
    
    if (!messagesContainer) {
        console.log('Chatbot messages container not found, retrying...');
        setTimeout(() => window.sendChatbotMessage(message), 500);
        return;
    }
    
    // Hide suggestions after first message
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
    
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'chatbot-message chatbot-message-user';
    userMessage.innerHTML = `
        <div class="chatbot-message-content">
            <p>${message}</p>
        </div>
    `;
    messagesContainer.appendChild(userMessage);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chatbot-message chatbot-message-bot chatbot-typing';
    typingIndicator.innerHTML = `
        <div class="chatbot-message-avatar">
            <span class="material-symbols-outlined">smart_toy</span>
        </div>
        <div class="chatbot-message-content">
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Get response after delay
    setTimeout(() => {
        typingIndicator.remove();
        const response = window.getChatbotResponse(message);
        const botMessage = document.createElement('div');
        botMessage.className = 'chatbot-message chatbot-message-bot';
        botMessage.innerHTML = `
            <div class="chatbot-message-avatar">
                <span class="material-symbols-outlined">smart_toy</span>
            </div>
            <div class="chatbot-message-content">
                <p>${response}</p>
            </div>
        `;
        messagesContainer.appendChild(botMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000);
};

window.getChatbotResponse = function(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for exact matches first
    for (const [key, value] of Object.entries(chatbotData)) {
        if (lowerMessage.includes(key)) {
            return value;
        }
    }
    
    // Default responses based on keywords
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return "Hello! I'm here to help you learn more about aippoint. What would you like to know?";
    }
    
    if (lowerMessage.includes('thank')) {
        return "You're welcome! Is there anything else you'd like to know about aippoint?";
    }
    
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
        return "Thank you for chatting! Feel free to come back anytime if you have more questions about aippoint.";
    }
    
    // Generic response
    return "That's a great question! While I don't have specific information about that right now, I'd be happy to connect you with our team. You can contact us directly for more detailed information. Is there anything else I can help you with?";
};

window.sendChatbotMessageFromInput = function() {
    const input = document.getElementById('chatbotInput');
    if (input && input.value.trim()) {
        window.sendChatbotMessage(input.value);
        input.value = '';
    }
};

window.handleChatbotKeyPress = function(event) {
    if (event.key === 'Enter') {
        window.sendChatbotMessageFromInput();
    }
};

// ============================================
// INITIALIZE WHEN DOM IS READY
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing global functions...');
    
    // Ensure functions are available globally
    if (typeof window.openCalendarModal === 'function') {
        console.log('openCalendarModal is available');
    } else {
        console.error('openCalendarModal is not available');
    }
    
    if (typeof window.handleSetupSubmit === 'function') {
        console.log('handleSetupSubmit is available');
    } else {
        console.error('handleSetupSubmit is not available');
    }
    
    // Add event listeners for better practice (optional - can replace inline onclick)
    const calendarButtons = document.querySelectorAll('[onclick*="openCalendarModal"]');
    calendarButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            window.openCalendarModal();
        });
    });
    
    const setupButtons = document.querySelectorAll('[onclick*="handleSetupSubmit"]');
    setupButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            window.handleSetupSubmit();
        });
    });
});

// ============================================
// REST OF THE SCRIPT (existing code)
// ============================================
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle - Wait for elements to be loaded
function initializeMobileMenu() {
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
    const navMenuBackdrop = document.getElementById('navMenuBackdrop');

    if (menuToggle && navMenu) {
        function toggleMenu() {
            const isActive = navMenu.classList.contains('active');
            
            if (isActive) {
                // Close menu
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                if (navMenuBackdrop) navMenuBackdrop.classList.remove('active');
                document.body.classList.remove('menu-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            } else {
                // Open menu
                menuToggle.classList.add('active');
                navMenu.classList.add('active');
                if (navMenuBackdrop) navMenuBackdrop.classList.add('active');
                document.body.classList.add('menu-open');
                menuToggle.setAttribute('aria-expanded', 'true');
            }
        }
        
        menuToggle.addEventListener('click', toggleMenu);
        
        // Close menu when clicking backdrop
        if (navMenuBackdrop) {
            navMenuBackdrop.addEventListener('click', toggleMenu);
        }

// Close menu when clicking on a link
        if (navMenu) {
            navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
                    if (navMenuBackdrop) navMenuBackdrop.classList.remove('active');
                    document.body.classList.remove('menu-open');
                    menuToggle.setAttribute('aria-expanded', 'false');
    });
});
        }
        
        // Close menu on window resize if it becomes desktop size
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                if (navMenuBackdrop) navMenuBackdrop.classList.remove('active');
                document.body.classList.remove('menu-open');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

// Initialize mobile menu when DOM is ready or when header is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
});

// Also try to initialize when header might be loaded asynchronously
setTimeout(initializeMobileMenu, 100);

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Form Validation (for future forms)
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Analytics Tracking (placeholder)
function trackEvent(eventName, eventData) {
    // In a real implementation, this would send data to your analytics service
    console.log('Event tracked:', eventName, eventData);
}

// Smooth Scroll to Section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offset = 80; // Account for fixed navbar
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Update all anchor links to use smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        if (targetId) {
            scrollToSection(targetId);
        }
    });
});

// AOS (Animate On Scroll) Implementation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const aosObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
        }
    });
}, observerOptions);

// Observe all elements with data-aos attribute
document.querySelectorAll('[data-aos]').forEach(el => {
    aosObserver.observe(el);
});

// ROI Calculator
function calculateROI() {
    const candidates = parseFloat(document.getElementById('candidates').value) || 0;
    const hourlyRate = parseFloat(document.getElementById('hourly-rate').value) || 0;
    const timePerCandidate = parseFloat(document.getElementById('time-per-candidate').value) || 0;

    // Calculate time saved (80% reduction)
    const totalTime = candidates * timePerCandidate;
    const timeSaved = totalTime * 0.8; // 80% time reduction

    // Calculate cost saved
    const costSaved = timeSaved * hourlyRate;

    // Annual savings
    const annualSavings = costSaved * 12;

    // Efficiency gain
    const efficiency = 80; // 80% efficiency gain

    // Update UI with animation
    animateValue('timeSaved', 0, Math.round(timeSaved), 1000);
    animateValue('costSaved', 0, Math.round(costSaved), 1000);
    animateValue('annualSavings', 0, Math.round(annualSavings), 1000);
    animateValue('efficiency', 0, efficiency, 1000);
}

function animateValue(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const startTime = performance.now();
    const isCurrency = elementId.includes('Saved') || elementId.includes('Savings');
    const isPercentage = elementId === 'efficiency';

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(start + (end - start) * easeOutQuart);

        if (isCurrency) {
            element.textContent = '$' + current.toLocaleString();
        } else if (isPercentage) {
            element.textContent = current + '%';
        } else {
            element.textContent = current.toLocaleString();
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// Auto-calculate ROI on input change
document.getElementById('candidates').addEventListener('input', calculateROI);
document.getElementById('hourly-rate').addEventListener('input', calculateROI);
document.getElementById('time-per-candidate').addEventListener('input', calculateROI);

// Initial ROI calculation
calculateROI();

// FAQ Toggle
function toggleFAQ(button) {
    const faqItem = button.parentElement;
    const isActive = faqItem.classList.contains('active');

    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });

    // Open clicked item if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Demo Modal
function openDemoModal() {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('demoVideo');
    if (modal && video) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        video.play();
    }
}

function closeDemoModal() {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('demoVideo');
    if (modal && video) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        video.pause();
        video.currentTime = 0;
    }
}

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDemoModal();
        if (typeof closeInterviewPreview === 'function') {
            closeInterviewPreview();
        }
    }
});

// Signup Modal (placeholder)
function openSignup() {
    scrollToSection('contact');
}

// ============================================
// 1-MIN AI INTERVIEW PREVIEW
// ============================================
let interviewPreviewTimer = null;
let interviewPreviewCountdownInterval = null;

function openInterviewPreview() {
    const overlay = document.getElementById('interviewPreviewOverlay');
    const countdownEl = document.getElementById('interviewPreviewCountdown');
    if (!overlay) return;

    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Count down from 1:00 to 0:00
    let timeLeft = 60; // 1 minute in seconds
    if (countdownEl) {
        updateCountdownDisplay(countdownEl, timeLeft);
    }

    // Clear any existing timers
    if (interviewPreviewTimer) {
        clearTimeout(interviewPreviewTimer);
        interviewPreviewTimer = null;
    }
    if (interviewPreviewCountdownInterval) {
        clearInterval(interviewPreviewCountdownInterval);
        interviewPreviewCountdownInterval = null;
    }

    // Set up countdown interval (updates every second)
    interviewPreviewCountdownInterval = setInterval(() => {
        timeLeft--;
        
        if (countdownEl) {
            updateCountdownDisplay(countdownEl, timeLeft);
        }
        
        // When time runs out, close the preview
        if (timeLeft <= 0) {
            clearInterval(interviewPreviewCountdownInterval);
            closeInterviewPreview();
        }
    }, 1000);

    // Safety timeout to ensure preview closes after 1 minute
    interviewPreviewTimer = setTimeout(() => {
        clearInterval(interviewPreviewCountdownInterval);
        closeInterviewPreview();
    }, 60000);
}

function updateCountdownDisplay(element, seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    element.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    
    // Add visual feedback when time is running low
    if (seconds <= 10) {
        element.style.color = '#ff4d4f';
        element.style.fontWeight = 'bold';
        if (seconds <= 5) {
            element.style.animation = 'pulse 0.5s infinite';
        }
    } else {
        element.style.color = '';
        element.style.fontWeight = '';
        element.style.animation = '';
    }
}

function closeInterviewPreview() {
    const overlay = document.getElementById('interviewPreviewOverlay');
    const countdownEl = document.getElementById('interviewPreviewCountdown');
    if (!overlay) return;

    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Reset countdown display
    if (countdownEl) {
        countdownEl.textContent = '01:00';
        countdownEl.style.color = '';
        countdownEl.style.fontWeight = '';
        countdownEl.style.animation = '';
    }

    // Clear timers
    if (interviewPreviewTimer) {
        clearTimeout(interviewPreviewTimer);
        interviewPreviewTimer = null;
    }
    if (interviewPreviewCountdownInterval) {
        clearInterval(interviewPreviewCountdownInterval);
        interviewPreviewCountdownInterval = null;
    }
}

// Calendar Modal with Cal.com Integration
var calInitialized = false;

// Open modal function
function openBookingModal(e) {
    if (e) {
        e.preventDefault();
    }
    const bookingModal = document.getElementById('booking-modal');
    if (bookingModal) {
        bookingModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        if (!calInitialized) {
            // Check if script already exists
            let scriptExists = document.querySelector('script[src*="cal.com/embed"]');
            
            if (!scriptExists) {
                // Initialize Cal.com embed script loader
                (function (C, A, L) { 
                    let p = function (a, ar) { a.q.push(ar); }; 
                    let d = C.document; 
                    C.Cal = C.Cal || function () { 
                        let cal = C.Cal; 
                        let ar = arguments; 
                        if (!cal.loaded) { 
                            cal.ns = {}; 
                            cal.q = cal.q || []; 
                            const script = d.createElement("script");
                            script.src = A;
                            script.async = true;
                            d.head.appendChild(script); 
                            cal.loaded = true; 
                        } 
                        if (ar[0] === L) { 
                            const api = function () { p(api, arguments); }; 
                            const namespace = ar[1]; 
                            api.q = api.q || []; 
                            if(typeof namespace === "string") {
                                cal.ns[namespace] = cal.ns[namespace] || api;
                                p(cal.ns[namespace], ar);
                                p(cal, ["initNamespace", namespace]);
                            } else p(cal, ar); 
                            return;
                        } 
                        p(cal, ar); 
                    }; 
                })(window, "https://app.cal.com/embed/embed.js", "init");
            }
            
            // Wait for script to load, then initialize
            let attempts = 0;
            const maxAttempts = 500; // 50 seconds max wait (10 times longer)
            
            function initCal() {
                attempts++;
                
                if (typeof window.Cal !== 'undefined') {
                    try {
                        // Initialize Cal.com
                        window.Cal("init", "30-min-meeting", {origin:"https://app.cal.com"});
                        
                        // Wait for namespace to be ready
                        setTimeout(function() {
                            if (window.Cal.ns && window.Cal.ns["30-min-meeting"]) {
                                window.Cal.ns["30-min-meeting"]("inline", {
                                    elementOrSelector: "#my-cal-inline-30-min-meeting",
                                    config: {"layout":"month_view"},
                                    calLink: "shreyash.iosys/30-min-meeting",
                                });
                                window.Cal.ns["30-min-meeting"]("ui", {
                                    "hideEventTypeDetails": false,
                                    "layout": "month_view"
                                });
                                
                                calInitialized = true;
                                
                                // Hide loading message after calendar loads
                                setTimeout(function() {
                                    const loadingDiv = document.getElementById('cal-loading');
                                    if (loadingDiv) {
                                        loadingDiv.style.display = 'none';
                                    }
                                }, 2000);
                            } else if (attempts < maxAttempts) {
                                // Retry if namespace not ready
                                setTimeout(initCal, 200);
                            } else {
                                console.error("Cal.com namespace not available after max attempts");
                                // Fallback to iframe
                                useIframeFallback();
                            }
                        }, 300);
                    } catch(e) {
                        console.error("Cal.com initialization error:", e);
                        if (attempts < maxAttempts) {
                            setTimeout(initCal, 500);
                        } else {
                            useIframeFallback();
                        }
                    }
                } else if (attempts < maxAttempts) {
                    // Script not loaded yet, retry
                    setTimeout(initCal, 100);
                } else {
                    console.error("Cal.com script failed to load, using iframe fallback");
                    useIframeFallback();
                }
            }
            
            // Fallback function using iframe
            function useIframeFallback() {
                const calContainer = document.getElementById('my-cal-inline-30-min-meeting');
                const loadingDiv = document.getElementById('cal-loading');
                if (calContainer && loadingDiv) {
                    loadingDiv.style.display = 'none';
                    calContainer.innerHTML = '<iframe src="https://app.cal.com/shreyash.iosys/30-min-meeting" style="width:100%;height:100%;border:none;" frameborder="0"></iframe>';
                    calInitialized = true;
                }
            }
            
            // Start initialization
            setTimeout(initCal, 300);
        }
    }
}

// Close modal function
function closeBookingModal() {
    const bookingModal = document.getElementById('booking-modal');
    if (bookingModal) {
        bookingModal.style.display = 'none';
        document.body.style.overflow = ''; // Re-enable scrolling
    }
}

// Initialize calendar modal event listeners (matching front-page.php)
document.addEventListener('DOMContentLoaded', function() {
    const bookingModal = document.getElementById('booking-modal');
    const closeBtn = document.getElementById('close-booking');
    
    // Event listeners for close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeBookingModal);
    }
    
    // Close when clicking outside the modal content
    if (bookingModal) {
        bookingModal.addEventListener('click', function(e) {
            if (e.target === bookingModal) {
                closeBookingModal();
            }
        });
    }
    
    // Close with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeBookingModal();
        }
    });
});

// Calendar Form Handler (kept for backward compatibility if needed)
function handleCalendarSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // Here you would typically send the data to your server
    console.log('Calendar form submitted:', Object.fromEntries(formData));
    
    // Show success message
    alert('Demo scheduled successfully! We will send you a confirmation email shortly.');
    closeCalendarModal();
    
    // Track form submission
    trackEvent('calendar_form_submit', {
        form_name: 'calendar_form'
    });
}

// Contact Form Handler
function handleContactSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // Get form data
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Send email to hr@aippoint.ai
    fetch('http://127.0.0.1:3000/api/send-contact-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: formData.get('name') || 'N/A',
            email: email,
            company: formData.get('company') || 'N/A',
            message: message,
            formType: 'contact'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Contact email sent:', data);
        
        // Show success message
        alert('Thank you for your message! We will get back to you soon.');
        form.reset();
        
        // Track form submission
        if (typeof trackEvent === 'function') {
            trackEvent('contact_form_submit', {
                form_name: 'contact_form'
            });
        }
    })
    .catch(error => {
        console.error('Error sending contact email:', error);
        
        // Still show success message to user even if email fails
        alert('Thank you for your message! We will get back to you soon.');
        form.reset();
    });
}

// Parallax Effect for Hero Section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual && scrolled < window.innerHeight) {
        heroVisual.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroVisual.style.opacity = 1 - (scrolled / window.innerHeight) * 0.5;
    }
});

// Animate Dashboard Cards on Load
window.addEventListener('load', () => {
    const cards = document.querySelectorAll('.animated-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateX(0)';
        }, index * 200);
    });
});

// Animate Chart Bars
function animateChartBars() {
    const bars = document.querySelectorAll('.bar');
    bars.forEach((bar, index) => {
        setTimeout(() => {
            bar.style.animation = 'growBar 1s ease-out forwards';
        }, index * 100);
    });
}

// Trigger chart animation when in viewport
const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateChartBars();
            chartObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const chartContainer = document.querySelector('.chart-container');
if (chartContainer) {
    chartObserver.observe(chartContainer);
}

// Counter Animation for Trust Indicators
function animateCounters() {
    const counters = document.querySelectorAll('.trust-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/\D/g, ''));
        const suffix = counter.textContent.replace(/\d/g, '');
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target + suffix;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current) + suffix;
            }
        }, 30);
    });
}

// Trigger counter animation when hero section is in view
const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            heroObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroSection = document.getElementById('hero');
if (heroSection) {
    heroObserver.observe(heroSection);
}

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Initialize Testimonials Auto-Scroll - seamless// Testimonial Auto-scroll
function initTestimonialScroll() {
    const track = document.getElementById('testimonialsTrack');
    if (!track) return;

    // Pause animation on hover
    track.addEventListener('mouseenter', () => {
        track.style.animationPlayState = 'paused';
    });

    track.addEventListener('mouseleave', () => {
        track.style.animationPlayState = 'running';
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            track.style.animation = 'none';
            void track.offsetWidth; // Trigger reflow
            track.style.animation = 'scroll 30s linear infinite';
        }, 250);
    });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initTestimonialScroll();
    
    // Add ARIA attributes to form elements
    const formGroups = document.querySelectorAll('.setup-options-group');
    formGroups.forEach(group => {
        const groupName = group.getAttribute('data-group');
        const groupLabel = group.querySelector('h3');
        const buttons = group.querySelectorAll('.option-btn');
        
        if (groupLabel && buttons.length > 0) {
            const groupId = `${groupName}Group`;
            group.setAttribute('role', 'group');
            group.setAttribute('aria-labelledby', groupLabel.id || (groupLabel.id = groupId + 'Label'));
            
            buttons.forEach((button, index) => {
                button.setAttribute('role', 'radio');
                button.setAttribute('aria-checked', 'false');
                button.setAttribute('tabindex', index === 0 ? '0' : '-1');
                
                // Add keyboard navigation
                button.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        const nextButton = button.nextElementSibling || buttons[0];
                        if (nextButton) {
                            nextButton.focus();
                        }
                    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prevButton = button.previousElementSibling || buttons[buttons.length - 1];
                        if (prevButton) {
                            prevButton.focus();
                        }
                    } else if (e.key === 'Home') {
                        e.preventDefault();
                        buttons[0]?.focus();
                    } else if (e.key === 'End') {
                        e.preventDefault();
                        buttons[buttons.length - 1]?.focus();
                    }
                });
            });
        }
    });
    
    // Add a class to the body when JavaScript is enabled
    document.body.classList.add('js-enabled');
});

// Initialize Testimonials Auto-Scroll - seamless infinite scroll
function initTestimonialsScroll() {
    const testimonialsTrack = document.getElementById('testimonialsTrack');
    if (!testimonialsTrack) return;

    // Get original cards
    const originalCards = Array.from(testimonialsTrack.querySelectorAll('.testimonial-card'));
    if (originalCards.length === 0) return;

    // Clone all testimonials multiple times to ensure seamless loop (at least 2 sets)
    // We need enough clones to fill the viewport and create seamless loop
    for (let i = 0; i < 3; i++) {
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.setAttribute('data-clone', 'true');
            testimonialsTrack.appendChild(clone);
        });
    }
    
    // Ensure auto-scroll class is applied
    testimonialsTrack.classList.add('auto-scroll');
    
    // Auto-scroll functionality with seamless loop
    let scrollPosition = 0;
    const scrollSpeed = 0.8; // pixels per frame - smooth sliding speed
    let animationId;
    let isPaused = false;
    let lastTime = performance.now();
    
    // Calculate the width of one set (original cards)
    const cardWidth = originalCards[0].offsetWidth;
    const gap = 24; // gap between cards
    const setWidth = originalCards.length * (cardWidth + gap);

    function autoScroll(currentTime) {
        if (!testimonialsTrack.isConnected || isPaused) {
            return;
        }
        
        // Use delta time for consistent speed regardless of frame rate
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        // Calculate movement based on time (60fps = ~16.67ms per frame)
        const frameTime = 16.67;
        const speedMultiplier = deltaTime / frameTime;
        scrollPosition += scrollSpeed * speedMultiplier;
        
        // When we've scrolled one full set, reset seamlessly
        if (scrollPosition >= setWidth) {
            scrollPosition = scrollPosition - setWidth;
            // Reset position without animation to make it seamless
            testimonialsTrack.style.transition = 'none';
            testimonialsTrack.style.transform = `translateX(-${scrollPosition}px)`;
            // Force reflow
            void testimonialsTrack.offsetWidth;
        }
        
        // Apply smooth sliding with CSS transform
        testimonialsTrack.style.transition = 'none';
        testimonialsTrack.style.transform = `translateX(-${scrollPosition}px)`;
        
        animationId = requestAnimationFrame(autoScroll);
    }

    // Start auto-scroll after a short delay
    let startTimeout = setTimeout(() => {
        lastTime = performance.now();
        autoScroll(performance.now());
    }, 500);

    // Pause on hover
    const container = testimonialsTrack.closest('.testimonials-container-inner');
    if (container) {
        container.addEventListener('mouseenter', () => {
            isPaused = true;
            cancelAnimationFrame(animationId);
            clearTimeout(startTimeout);
        });

        container.addEventListener('mouseleave', () => {
            isPaused = false;
            // Restart auto-scroll after a delay
            startTimeout = setTimeout(() => {
                lastTime = performance.now();
                autoScroll(performance.now());
            }, 300);
        });
    }

    // Handle touch events for mobile
    let touchStartX = 0;
    let isDragging = false;
    let touchScrollPosition = scrollPosition;

    if (container) {
        container.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            isDragging = true;
            isPaused = true;
            touchScrollPosition = scrollPosition;
            cancelAnimationFrame(animationId);
            clearTimeout(startTimeout);
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (isDragging) {
                const touchCurrentX = e.touches[0].clientX;
                const diff = touchStartX - touchCurrentX;
                scrollPosition = touchScrollPosition + diff;
                testimonialsTrack.style.transition = 'none';
                testimonialsTrack.style.transform = `translateX(-${scrollPosition}px)`;
            }
        }, { passive: true });

        container.addEventListener('touchend', () => {
            isDragging = false;
            // Restart auto-scroll after a delay
            setTimeout(() => {
                isPaused = false;
                lastTime = performance.now();
                autoScroll(performance.now());
            }, 1000);
        }, { passive: true });
    }
}

// Track CTA clicks
document.querySelectorAll('.btn-primary, .btn-secondary, .btn-cta').forEach(button => {
    button.addEventListener('click', (e) => {
        // Don't track if it's a disabled button
        if (button.hasAttribute('disabled') || button.classList.contains('disabled')) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        
        trackEvent('cta_click', {
            button_text: button.textContent.trim(),
            section: button.closest('section')?.id || 'unknown'
        });
    });
});

// Track scroll depth
let maxScroll = 0;
window.addEventListener('scroll', () => {
    const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
    if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll % 25 === 0) {
            trackEvent('scroll_depth', { depth: maxScroll });
        }
    }
});

// Performance optimization: Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    obs.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Add smooth reveal animation to sections
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
});

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    sectionObserver.observe(section);
});

// Keyboard navigation for accessibility
document.addEventListener('keydown', (e) => {
    // ESC key closes mobile menu or modal
    if (e.key === 'Escape') {
        const navMenu = document.getElementById('navMenu');
        const menuToggle = document.getElementById('menuToggle');
        const navMenuBackdrop = document.getElementById('navMenuBackdrop');
        
        if (navMenu && navMenu.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            if (navMenuBackdrop) navMenuBackdrop.classList.remove('active');
            document.body.classList.remove('menu-open');
            if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        }
        closeDemoModal();
        closeCalendarModal();
    }
});

// Focus management for accessibility
document.querySelectorAll('.btn, .faq-question, a').forEach(element => {
    element.addEventListener('focus', (e) => {
        e.target.style.outline = '2px solid var(--primary)';
        e.target.style.outlineOffset = '2px';
    });
    
    element.addEventListener('blur', (e) => {
        e.target.style.outline = '';
        e.target.style.outlineOffset = '';
    });
});

// ============================================
// LEAD MAGNET FUNCTIONALITY
// ============================================

// Lead Magnet Form Handler (Inline Section)
function handleLeadMagnetSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const emailInput = form.querySelector('input[type="email"]');
    const submitButton = form.querySelector('button[type="submit"]');
    const btnText = submitButton.querySelector('.btn-text');
    const btnLoading = submitButton.querySelector('.btn-loading');
    const successDiv = document.getElementById('leadMagnetSuccess');
    const email = emailInput.value.trim();

    // Validate email
    if (!validateEmail(email)) {
        emailInput.focus();
        emailInput.style.borderColor = '#ef4444';
        setTimeout(() => {
            emailInput.style.borderColor = '';
        }, 2000);
        return;
    }

    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    submitButton.disabled = true;

    // Simulate API call (replace with actual API endpoint)
    setTimeout(() => {
        // Log email (replace with actual API call)
        console.log('Lead magnet email captured:', email);
        
        // Track event
        trackEvent('lead_magnet_submit', {
            form_type: 'inline',
            email: email
        });

        // Hide form, show success
        form.style.display = 'none';
        successDiv.style.display = 'block';
        
        // Reset button state
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        submitButton.disabled = false;

        // Optional: Show download link after 2 seconds
        setTimeout(() => {
            const downloadLink = document.getElementById('downloadLink');
            if (downloadLink) {
                downloadLink.style.display = 'inline-block';
            }
        }, 2000);
    }, 1500);
}

// Exit-Intent Form Handler
function handleExitIntentSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const emailInput = form.querySelector('input[type="email"]');
    const submitButton = form.querySelector('button[type="submit"]');
    const btnText = submitButton.querySelector('.btn-text');
    const btnLoading = submitButton.querySelector('.btn-loading');
    const successDiv = document.getElementById('exitIntentSuccess');
    const email = emailInput.value.trim();

    // Validate email
    if (!validateEmail(email)) {
        emailInput.focus();
        emailInput.style.borderColor = '#ef4444';
        setTimeout(() => {
            emailInput.style.borderColor = '';
        }, 2000);
        return;
    }

    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    submitButton.disabled = true;

    // Simulate API call (replace with actual API endpoint)
    setTimeout(() => {
        // Log email (replace with actual API call)
        console.log('Exit-intent email captured:', email);
        
        // Track event
        trackEvent('lead_magnet_submit', {
            form_type: 'exit_intent',
            email: email
        });

        // Hide form, show success
        form.style.display = 'none';
        successDiv.style.display = 'block';
        
        // Reset button state
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        submitButton.disabled = false;

        // Close modal after 3 seconds
        setTimeout(() => {
            closeExitIntentModal();
        }, 3000);
    }, 1500);
}

// Exit-Intent Modal Functions
function openExitIntentModal() {
    const modal = document.getElementById('exitIntentModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first input for accessibility
        const emailInput = modal.querySelector('input[type="email"]');
        if (emailInput) {
            setTimeout(() => emailInput.focus(), 100);
        }
        
        // Trap focus inside modal
        trapFocus(modal);
    }
}

function closeExitIntentModal() {
    const modal = document.getElementById('exitIntentModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset form
        const form = document.getElementById('exitIntentForm');
        const successDiv = document.getElementById('exitIntentSuccess');
        if (form) {
            form.style.display = 'block';
            form.reset();
        }
        if (successDiv) {
            successDiv.style.display = 'none';
        }
    }
}

// Setup Email Modal Functions
function openSetupEmailModal() {
    const modal = document.getElementById('setupEmailModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        const emailInput = modal.querySelector('#setup-email');
        if (emailInput) {
            setTimeout(() => emailInput.focus(), 100);
        }
    }
}

function closeSetupEmailModal() {
    const modal = document.getElementById('setupEmailModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        const form = document.getElementById('setupEmailForm');
        const successDiv = document.getElementById('setupEmailSuccess');
        if (form) {
            form.style.display = 'block';
            form.reset();
        }
        if (successDiv) {
            successDiv.style.display = 'none';
        }
    }
}

function handleSetupEmailSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const emailInput = form.querySelector('input[type=\"email\"]');
    const submitButton = form.querySelector('button[type=\"submit\"]');
    const btnText = submitButton.querySelector('.btn-text');
    const btnLoading = submitButton.querySelector('.btn-loading');
    const successDiv = document.getElementById('setupEmailSuccess');
    const email = emailInput.value.trim();

    if (!validateEmail(email)) {
        emailInput.focus();
        emailInput.style.borderColor = '#ef4444';
        setTimeout(() => {
            emailInput.style.borderColor = '';
        }, 2000);
        return;
    }

    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    submitButton.disabled = true;

    setTimeout(() => {
        console.log('Setup email captured:', email);

        if (typeof trackEvent === 'function') {
            trackEvent('setup_email_submit', {
                form_type: 'setup_modal',
                email: email
            });
        }

        form.style.display = 'none';
        if (successDiv) {
            successDiv.style.display = 'block';
        }

        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        submitButton.disabled = false;

        setTimeout(() => {
            closeSetupEmailModal();
        }, 2500);
    }, 1500);
}

// Focus trapping for accessibility
function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    modal.addEventListener('keydown', function trapHandler(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
        if (e.key === 'Escape') {
            closeExitIntentModal();
            modal.removeEventListener('keydown', trapHandler);
        }
    });
}

// Exit-Intent Detection
(function initExitIntent() {
    // Only on desktop (screen width > 768px)
    if (window.innerWidth <= 768) return;
    
    // Check if already shown in this session
    if (sessionStorage.getItem('exitIntentShown') === 'true') return;
    
    let mouseY = 0;
    let timeOnPage = 0;
    const triggerDelay = 5000; // 5 seconds minimum time on page
    
    // Track time on page
    const timeTracker = setInterval(() => {
        timeOnPage += 1000;
    }, 1000);
    
    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        mouseY = e.clientY;
    });
    
    // Detect exit intent (mouse leaving top of viewport)
    document.addEventListener('mouseleave', (e) => {
        // Only trigger if:
        // 1. Mouse is moving upward (leaving from top)
        // 2. User has been on page for at least 5 seconds
        // 3. Popup hasn't been shown this session
        if (mouseY < 50 && timeOnPage >= triggerDelay && sessionStorage.getItem('exitIntentShown') !== 'true') {
            openExitIntentModal();
            sessionStorage.setItem('exitIntentShown', 'true');
            clearInterval(timeTracker);
        }
    });
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        clearInterval(timeTracker);
    });
})();

// Close exit-intent modal on overlay click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('exitIntentModal');
    if (modal && e.target.classList.contains('modal-overlay')) {
        closeExitIntentModal();
    }
});

// Handle dropdown change for Primary hiring focus
function handleFocusChange(selectElement) {
    if (!selectElement) return;
    
    const focusValidation = document.getElementById('focusValidation');
    const selectedValue = selectElement.value;
    
    // Clear validation message
    if (focusValidation) {
        focusValidation.style.display = 'none';
        focusValidation.textContent = '';
        focusValidation.classList.remove('error');
    }
    
    // Remove error styling from select
    selectElement.classList.remove('error-state');
    selectElement.style.borderColor = '';
}

// Global function to handle option button selection (can be called from inline onclick)
function selectOption(clickedButton) {
    if (!clickedButton) return;
    
    const groupName = clickedButton.getAttribute('data-group');
    if (!groupName) return;
    
    // Get all buttons in the same group
    const groupButtons = document.querySelectorAll(`.option-btn[data-group="${groupName}"]`);
    
    // Get validation messages
    const hiresValidation = document.getElementById('hiresValidation');
    const focusValidation = document.getElementById('focusValidation');
    const validationMessages = {
        'hires': hiresValidation,
        'focus': focusValidation
    };
    
    // Remove selected class and error state from all buttons in this group only
    groupButtons.forEach(btn => {
        btn.classList.remove('selected', 'active', 'error-state');
        btn.style.borderColor = '';
        
        // Hide check icon for focus buttons
        const checkIcon = btn.querySelector('.check-icon');
        if (checkIcon) {
            checkIcon.style.display = 'none';
        }
    });
    
    // Add selected and active class to clicked button
    clickedButton.classList.add('selected', 'active');
    
    // Show check icon for selected focus button
    const checkIcon = clickedButton.querySelector('.check-icon');
    if (checkIcon) {
        checkIcon.style.display = 'block';
    }
    
    // Clear validation message for this group
    const validationMsg = validationMessages[groupName];
    if (validationMsg) {
        validationMsg.style.display = 'none';
        validationMsg.textContent = '';
        validationMsg.classList.remove('error');
    }
}

// Personalized Setup Form Interactions
document.addEventListener('DOMContentLoaded', function() {
    // Initialize testimonials scroll
    initTestimonialsScroll();
    
    // Get form elements
    const submitBtn = document.getElementById('setupSubmitBtn');
    const hiresValidation = document.getElementById('hiresValidation');
    const focusValidation = document.getElementById('focusValidation');
    const emailInput = document.getElementById('setupEmail');
    const emailValidation = document.getElementById('emailValidation');
    
    // Validation message mapping
    const validationMessages = {
        'hires': hiresValidation,
        'focus': focusValidation,
        'email': emailValidation
    };
    
    // Function to get all buttons in the same group
    function getGroupButtons(groupName) {
        return document.querySelectorAll(`.option-btn[data-group="${groupName}"]`);
    }

    // Function to get selected button in a group
    function getSelectedButton(groupName) {
        return document.querySelector(`.option-btn[data-group="${groupName}"].selected`);
    }

    // Function to check if all fields are valid and enable/disable submit button
    function checkFormValidity() {
        const hiresSelected = getSelectedButton('hires');
        const focusSelect = document.getElementById('focusSelect');
        const focusValue = focusSelect ? focusSelect.value : '';
        const submitButton = document.getElementById('setupSubmitBtn');
        const emailValue = emailInput ? emailInput.value.trim() : '';
        const emailOk = emailInput ? validateEmail(emailValue) : true;
        const companyNameInput = document.getElementById('setupCompanyName');
        const companyNameValue = companyNameInput ? companyNameInput.value.trim() : '';
        const companyNameOk = companyNameValue && companyNameValue.length >= 2;
        const countrySelect = document.getElementById('setupCountry');
        const countryValue = countrySelect ? countrySelect.value : '';
        const countryOk = countryValue && countryValue.length > 0;
        
        if (submitButton) {
            if (hiresSelected && focusValue && emailOk && companyNameOk && countryOk) {
                submitButton.disabled = false;
            } else {
                submitButton.disabled = true;
            }
        }
        
        return hiresSelected && focusValue && emailOk && companyNameOk && countryOk;
    }
    
    // Track if a click is being processed to prevent duplicate handling
    let isProcessingClick = false;

    // Generic handler for option button clicks (scoped by data-group)
    function handleOptionClick(clickedButton) {
        // Prevent multiple rapid clicks
        if (isProcessingClick) return;
        isProcessingClick = true;
        
        try {
            const groupName = clickedButton.getAttribute('data-group');
            if (!groupName) {
                isProcessingClick = false;
                return;
            }
            
            // Get all buttons in the same group
            const groupButtons = getGroupButtons(groupName);
            
            // Remove selected class and error state from all buttons in this group only
            groupButtons.forEach(btn => {
                btn.classList.remove('selected', 'active', 'error-state');
                btn.style.borderColor = '';
                
                // Hide check icon for focus buttons
                const checkIcon = btn.querySelector('.check-icon');
                if (checkIcon) {
                    checkIcon.style.display = 'none';
                }
            });
            
            // Add selected and active class to clicked button
            clickedButton.classList.add('selected', 'active');
            
            // Show check icon for selected focus button
            const checkIcon = clickedButton.querySelector('.check-icon');
            if (checkIcon) {
                checkIcon.style.display = 'block';
            }
            
            // Clear validation message for this group
            const validationMsg = validationMessages[groupName];
            if (validationMsg) {
                validationMsg.style.display = 'none';
                validationMsg.textContent = '';
                validationMsg.classList.remove('error');
            }
            
            // Check form validity and update submit button state
            checkFormValidity();
            
        } catch (error) {
            console.error('Error handling option click:', error);
        } finally {
            // Reset the flag after a small delay to prevent rapid clicks
            setTimeout(() => {
                isProcessingClick = false;
            }, 50);
        }
    }

    // Use document-level delegation for reliable click handling
    // This handles clicks on buttons and child elements (like span, svg)
    document.addEventListener('click', function(e) {
        // Find the closest option button (handles clicks on button or child elements)
        const optionBtn = e.target.closest('.option-btn[data-group]');
        if (optionBtn) {
            e.stopPropagation(); // Prevent event from bubbling
            handleOptionClick(optionBtn);
        }
    }, true); // Use capture phase for early handling

    // Email input validation listener
    if (emailInput) {
        emailInput.addEventListener('input', () => {
            if (emailValidation) {
                emailValidation.style.display = 'none';
                emailValidation.textContent = '';
                emailValidation.classList.remove('error');
            }
            if (emailInput) {
                emailInput.classList.remove('error-state');
                emailInput.style.borderColor = '';
            }
            checkFormValidity();
        });
    }
    
    // Company name input validation listener
    const companyNameInput = document.getElementById('setupCompanyName');
    const companyNameValidation = document.getElementById('companyNameValidation');
    if (companyNameInput) {
        companyNameInput.addEventListener('input', () => {
            if (companyNameValidation) {
                companyNameValidation.style.display = 'none';
                companyNameValidation.textContent = '';
                companyNameValidation.classList.remove('error');
            }
            if (companyNameInput) {
                companyNameInput.classList.remove('error-state');
                companyNameInput.style.borderColor = '';
            }
            checkFormValidity();
        });
    }
    
    // Country select validation listener
    const countrySelect = document.getElementById('setupCountry');
    const countryValidation = document.getElementById('countryValidation');
    if (countrySelect) {
        countrySelect.addEventListener('change', () => {
            if (countryValidation) {
                countryValidation.style.display = 'none';
                countryValidation.textContent = '';
                countryValidation.classList.remove('error');
            }
            if (countrySelect) {
                countrySelect.classList.remove('error-state');
                countrySelect.style.borderColor = '';
            }
            checkFormValidity();
        });
    }
    
    // Initial check (fields empty, so button should be disabled)
    checkFormValidity();
});

// Handle setup form submission
// Setup recommendations configuration
const setupRecommendations = {
    '1-10': {
        name: 'Essentials Setup',
        summary: 'Best for teams building their hiring foundation with focused, quality-first approaches.',
        features: [
            'Structured interview templates by role',
            'Consistent signal capture across interviewers',
            'Decision-ready summaries for hiring managers',
            'Stakeholder-aligned recommendations',
            'ATS-friendly workflow'
        ],
        whyFits: {
            'technology': 'You\'re building a focused technical team with intentional hiring. This setup ensures consistency and clarity without overwhelming your process.',
            'sales': 'You\'re establishing a high-quality sales hiring practice. This setup helps you capture the right signals and make confident decisions early.'
        }
    },
    '11-50': {
        name: 'Growth Setup',
        summary: 'Best for teams hiring regularly across technical and revenue roles.',
        features: [
            'Structured interview templates by role',
            'Consistent signal capture across interviewers',
            'Decision-ready summaries for hiring managers',
            'Stakeholder-aligned recommendations',
            'ATS-friendly workflow'
        ],
        whyFits: {
            'technology': 'You\'re hiring across multiple technical roles with moderate-to-high volume. This setup ensures consistency and fast alignment without adding admin overhead.',
            'sales': 'You\'re scaling your sales organization across different roles. This setup helps maintain quality and alignment as you grow your team efficiently.'
        }
    },
    '51-200': {
        name: 'Scale Setup',
        summary: 'Best for organizations with multi-role hiring and cross-functional collaboration needs.',
        features: [
            'Structured interview templates by role',
            'Consistent signal capture across interviewers',
            'Decision-ready summaries for hiring managers',
            'Stakeholder-aligned recommendations',
            'ATS-friendly workflow',
            'Advanced team collaboration',
            'Custom workflow configurations'
        ],
        whyFits: {
            'technology': 'You\'re hiring at scale across engineering, product, and technical leadership. This setup maintains quality standards and stakeholder alignment across all roles.',
            'sales': 'You\'re building a comprehensive revenue organization. This setup ensures consistent evaluation across sales, marketing, and customer success roles while moving quickly.'
        }
    },
    '200+': {
        name: 'Enterprise Setup',
        summary: 'Best for large organizations requiring comprehensive, coordinated hiring intelligence.',
        features: [
            'Structured interview templates by role',
            'Consistent signal capture across interviewers',
            'Decision-ready summaries for hiring managers',
            'Stakeholder-aligned recommendations',
            'ATS-friendly workflow',
            'Advanced team collaboration',
            'Custom workflow configurations',
            'Organization-wide standardization',
            'Dedicated implementation support'
        ],
        whyFits: {
            'technology': 'You\'re managing complex technical hiring across multiple teams and locations. This setup provides the standardization and coordination needed to maintain quality at enterprise scale.',
            'sales': 'You\'re coordinating revenue hiring across global teams and diverse markets. This setup ensures consistent evaluation while adapting to regional and role-specific needs.'
        }
    }
};

function showValidationError(groupName) {
    const buttons = getGroupButtons(groupName);
    buttons.forEach(button => {
        button.classList.add('error-state');
        button.setAttribute('aria-invalid', 'true');
        
        // Add error message ID to the first button for ARIA
        if (button === buttons[0]) {
            const errorId = `${groupName}-error`;
            const errorMessage = button.closest('.setup-options-group')?.querySelector('.validation-message');
            if (errorMessage) {
                errorMessage.id = errorId;
                button.setAttribute('aria-describedby', errorId);
            }
        }
    });
    
    // Show error message
    const groupContainer = document.querySelector(`.setup-options-group[data-group="${groupName}"]`);
    if (groupContainer) {
        const errorMessage = groupContainer.querySelector('.validation-message');
        if (errorMessage) {
            errorMessage.style.display = 'block';
            errorMessage.setAttribute('aria-hidden', 'false');
            
            // Add a role="alert" to ensure screen readers announce the error
            errorMessage.setAttribute('role', 'alert');
            
            // Force screen readers to announce the error
            const liveRegion = document.createElement('div');
            liveRegion.setAttribute('role', 'alert');
            liveRegion.setAttribute('aria-live', 'assertive');
            liveRegion.className = 'sr-only';
            liveRegion.textContent = `Please select an option for ${groupName === 'hires' ? 'how many hires you make per year' : 'your primary hiring focus'}.`;
            document.body.appendChild(liveRegion);
            
            // Remove the live region after it's been announced
            setTimeout(() => {
                liveRegion.remove();
            }, 1000);
        }
    }
}

function displayRecommendedSetup(setupRecommendation, focusValue) {
    const container = document.getElementById('recommendedPricingPlan');
    const setupCardName = document.getElementById('setupCardName');
    const setupCardSummary = document.getElementById('setupCardSummary');
    const includedFeatures = document.getElementById('includedFeatures');
    const fitExplanation = document.getElementById('fitExplanation');
    
    if (!container) return;
    
    // Get saved preferences for personalization
    let savedPreferences = null;
    try {
        const saved = sessionStorage.getItem('AIPPoint_user_preferences');
        if (saved) {
            savedPreferences = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Error reading saved preferences:', error);
    }
    
    // Get selected values for personalization text
    const hiresValue = savedPreferences?.hiresPerYear || 'your volume';
    const focusValueDisplay = savedPreferences?.hiringFocus === 'technology' ? 'Technology / Product' : 
                              savedPreferences?.hiringFocus === 'sales' ? 'Sales & Marketing' : 
                              'your focus';
    
    // Update setup details with personalized content
    setupCardName.textContent = setupRecommendation.name;
    setupCardSummary.textContent = setupRecommendation.summary;
    
    // Update features list
    includedFeatures.innerHTML = '';
    setupRecommendation.features.forEach(feature => {
        const featureItem = document.createElement('li');
        featureItem.className = 'included-feature-item';
        featureItem.textContent = feature;
        includedFeatures.appendChild(featureItem);
    });
    
    // Update why this fits explanation
    const explanation = setupRecommendation.whyFits[focusValue] || setupRecommendation.whyFits['technology'];
    fitExplanation.textContent = explanation;
    
    // Update recommendation subtitle with personalized info (if element exists)
    const recommendationSubtitle = container.querySelector('.recommendation-subtitle');
    if (recommendationSubtitle && savedPreferences) {
        const hiresDisplay = hiresValue.replace(/-/g, '–').replace('+', '+');
        recommendationSubtitle.textContent = `Optimized for ${hiresDisplay} hires per year / ${focusValueDisplay} roles`;
    }
    
    // Hide the form and show recommendation with smooth transition
    const formCard = document.querySelector('.setup-form-card');
    if (formCard) {
        formCard.style.opacity = '0';
        formCard.style.transform = 'translateY(-20px)';
        formCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        setTimeout(() => {
            formCard.style.display = 'none';
        }, 300);
    }
    
    // Reset button state (in case of re-display)
    const submitBtn = document.getElementById('setupSubmitBtn');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = 'Get a Custom Plan';
    }
    
    // Show the recommendation view with animation
    container.style.display = 'block';
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    container.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 100);
    
    // Scroll to recommendation view smoothly
    setTimeout(() => {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
}

function editAnswers() {
    const container = document.getElementById('recommendedPricingPlan');
    const formCard = document.querySelector('.setup-form-card');
    
    if (container && formCard) {
        // Hide recommendation view
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        setTimeout(() => {
            container.style.display = 'none';
        }, 300);
        
        // Show form again
        formCard.style.display = 'block';
        formCard.style.opacity = '0';
        formCard.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            formCard.style.opacity = '1';
            formCard.style.transform = 'translateY(0)';
            formCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        }, 50);
        
        // Scroll to form
        setTimeout(() => {
            formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 350);
    }
}

// ============================================
// HOW IT WORKS - 9 STEP WORKFLOW DATA
// ============================================
const howItWorksStepsData = [
    {
        number: '01',
        title: 'Upload & Organize Candidates',
        capabilities: 'AIPoint validates file types and quality, then automatically queues them for AI processing.',
        actions: 'Recruiters upload resumes individually or in bulk via drag-and-drop.',
        benefit: 'Candidates are grouped by role, campaign, or job opening for easy management.',
        metric: '⏱ Streamlined candidate intake',
        detail: 'Drag & drop individual or bulk resumes. Auto file validation and grouping by role.'
    },
    {
        number: '02',
        title: 'AI Resume Parsing & Profile Creation',
        capabilities: 'The AI engine reads each resume and converts it into a rich, structured profile.',
        actions: 'Experience, education, skills, certifications, and achievements are extracted and normalized.',
        benefit: 'A career timeline and skills map are created so recruiters can understand a candidate at a glance.',
        metric: '📊 Structured candidate profiles',
        detail: 'Structured profiles generated automatically. Skills, experience, certifications normalized. Career timeline and skills map created.'
    },
    {
        number: '03',
        title: 'Match Candidates to Job Descriptions',
        capabilities: 'The system semantically compares each candidate profile with the JD and computes a JD Match Score.',
        actions: 'Recruiters either create or import job descriptions into AIPoint.',
        benefit: 'Candidates are automatically ranked into High Match, Moderate Match, and Low Fit, with visible skill gaps and strengths.',
        metric: '🎯 Intelligent candidate ranking',
        detail: 'Semantic comparison with job descriptions. JD Match Score calculated. Candidates auto-ranked with skill gaps shown.'
    },
    {
        number: '04',
        title: 'Deep Skill & Behavioral Analysis',
        capabilities: 'For shortlisted candidates, AIPoint surfaces deeper insights: technical proficiency, domain experience, and soft skills signals.',
        actions: 'Stability, progression, and growth potential are highlighted based on the candidate\'s history and data patterns.',
        benefit: 'Risk and concern flags help identify profiles that may need extra scrutiny.',
        metric: '📈 Comprehensive candidate insights',
        detail: 'Technical proficiency scores. Soft skill and growth insights. Risk and stability flags surfaced.'
    },
    {
        number: '05',
        title: 'Coding Tests & AI Coding Interviews',
        capabilities: 'Candidates complete coding challenges or live coding interviews with real-time code editor.',
        actions: 'Automatic scoring, benchmarking, and solution analysis. Supports multiple languages and difficulty levels.',
        benefit: 'Test case pass/fail indicators and performance analysis help evaluate technical depth objectively.',
        metric: '💻 Automated technical assessment',
        detail: 'Candidates complete coding challenges or live coding interviews. Real-time code editor with test cases. Automatic scoring and performance analysis.'
    },
    {
        number: '06',
        title: 'Schedule Interviews',
        capabilities: 'AIPoint checks interviewer availability, suggests optimal times, and sends automated invites to candidates.',
        actions: 'Recruiters configure interview rounds, panel members, and time slots directly in the platform.',
        benefit: 'Reminders and updates go out automatically, reducing manual coordination.',
        metric: '⚡ Automated scheduling',
        detail: 'Configure interview rounds and panels. Smart availability matching. Automated invites and reminders.'
    },
    {
        number: '07',
        title: 'AI-Proctored Interviews',
        capabilities: 'During the session, AI monitors presence, gaze, background, and suspicious activity while remaining unobtrusive.',
        actions: 'Before the interview, the platform runs system checks (camera, mic, network).',
        benefit: 'Interviewers can score candidates and take notes in real time; everything is captured and securely stored.',
        metric: '🛡️ Secure interview monitoring',
        detail: 'System checks before interview. Live monitoring for integrity. Interviewers score and annotate in real time.'
    },
    {
        number: '08',
        title: 'AI Interview Analysis & Scoring',
        capabilities: 'After each interview, AIPoint generates a structured summary with technical and behavioral scores.',
        actions: 'Engagement, focus, and proctoring violations are included in a single, easy-to-read report.',
        benefit: 'The system provides clear recommendations and highlights strengths and weaknesses for decision-makers.',
        metric: '📊 Objective interview scoring',
        detail: 'Post-interview summaries generated automatically. Technical + behavioral scores combined. Clear strengths, weaknesses, and recommendations.'
    },
    {
        number: '09',
        title: 'Decide & Hire',
        capabilities: 'All resume, assessment, and interview data is consolidated into a single candidate view.',
        actions: 'Recruiters can filter, compare, and rank candidates across roles, stages, and teams.',
        benefit: 'Final decisions are supported by transparent analytics and exportable reports, turning hiring into a data-driven, collaborative process.',
        metric: '✅ Data-driven hiring decisions',
        detail: 'Unified candidate dashboard. Side-by-side comparisons. Export reports and finalize decisions.'
    }
];

// ============================================
// FEATURES - 8 FEATURE CATEGORIES DATA
// ============================================
const featureCategoriesData = [
    {
        name: 'AI-Powered Resume Processing',
        icon: '📄',
        description: 'Converts PDFs, DOCX, and images into structured profiles. Extracts experience, education, skills, and builds career timelines.',
        capabilities: [
            'Turn any resume (PDF, DOCX, even images) into structured profiles',
            'Automatically extracts personal details, experience, education, and skills',
            'Builds a clean timeline of the candidate\'s career',
            'Flags missing sections, inconsistencies, and low-quality resumes'
        ],
        metric: 'ACCURACY 99%'
    },
    {
        name: 'Intelligent Job Description Matching',
        icon: '🎯',
        description: 'Semantic AI understands context, not keywords. JD Match Score with High / Moderate / Low Fit grouping.',
        capabilities: [
            'Uses semantic AI (not just keywords) to understand job descriptions',
            'Assigns JD Match Score with confidence levels',
            'Groups candidates into High Match, Moderate Match, and Low Fit',
            'Skill gaps and match reasoning highlighted'
        ],
        metric: 'VELOCITY 3× Faster'
    },
    {
        name: 'Advanced Skill Analytics & Behavioral Insights',
        icon: '📊',
        description: 'Technical and domain skill heatmaps. Soft skills, stability, and growth signals. Risk flags and behavioral indicators.',
        capabilities: [
            'Evaluates technical and domain skills with visual proficiency scores',
            'Analyzes soft skills, stability, and growth potential',
            'Based on career trajectory and interview performance',
            'Surfaces risk flags and behavioral red flags'
        ],
        metric: 'INSIGHT Granular'
    },
    {
        name: 'AI Coding Interviews & Skill Assessments',
        icon: '💻',
        description: 'Live and automated coding interviews. Real-time code editor with problem statements. Automatic scoring, benchmarking, and solution analysis.',
        capabilities: [
            'Live and automated coding interviews with real-time code editor',
            'Automatic scoring, benchmarking, and solution analysis',
            'Supports multiple languages and difficulty levels',
            'Test case pass/fail indicators and performance analysis'
        ],
        metric: 'AUTOMATION 100%'
    },
    {
        name: 'Automated AI Interviews & Proctoring',
        icon: '🎤',
        description: 'Structured AI-assisted interviews. Face detection, gaze tracking, tab switching detection. Session recording with violation tracking.',
        capabilities: [
            'Runs structured, AI-assisted interviews with live or automated flows',
            'Real-time proctoring (face detection, gaze tracking, tab switching)',
            'Background monitoring ensures integrity',
            'Generates objective performance summaries and competency scores'
        ],
        metric: 'AVAILABILITY 24/7'
    },
    {
        name: 'Intelligent Interview Scheduling',
        icon: '📅',
        description: 'One-click scheduling for single or multi-round interviews. Calendar sync, automated invites and reminders.',
        capabilities: [
            'Plans single or multi-round interviews in a few clicks',
            'Syncs with calendars, sends automated invites and reminders',
            'Supports different interview types (technical, behavioral, panel)',
            'Reduces back-and-forth emails and no-shows'
        ],
        metric: 'RESCHEDULES -80%'
    },
    {
        name: 'Real-Time Analytics & Reporting',
        icon: '📈',
        description: 'Pipeline health, time-to-hire, pass rates. Side-by-side candidate comparisons. Exportable PDF / CSV reports.',
        capabilities: [
            'Unified dashboard showing pipeline health and key KPIs',
            'Time-to-hire, pass rates, offer acceptance tracking',
            'Detailed candidate comparison views with side-by-side scores',
            'Exportable reports (PDF/CSV) for leadership and compliance'
        ],
        metric: 'DATA LAG 0ms'
    },
    {
        name: 'Secure Candidate Verification & Compliance',
        icon: '🛡️',
        description: 'Identity verification and document validation. Full audit trails. Enterprise-grade security and privacy controls.',
        capabilities: [
            'Identity verification and document validation',
            'Activity tracking during interviews and assessments',
            'Full audit trails for every action taken',
            'Enterprise-grade security and privacy controls'
        ],
        metric: 'INTEGRITY 100%'
    }
];

// ============================================
// RENDER HOW IT WORKS SECTION
// ============================================
function renderHowItWorksSection() {
    const container = document.getElementById('howItWorksSteps');
    if (!container) return;

    container.innerHTML = howItWorksStepsData.map((step, index) => `
        <div class="how-it-works-step" data-step="${index + 1}" onclick="toggleStepDetail(${index + 1})">
            <div class="step-number-badge">STEP ${step.number}</div>
            <h3 class="step-title">${step.title}</h3>
            <div class="step-content">
                <div class="step-field">
                    <span class="step-field-label">Capabilities</span>
                    <p class="step-field-value">${step.capabilities}</p>
                </div>
                <div class="step-field">
                    <span class="step-field-label">What you see</span>
                    <p class="step-field-value">${step.actions}</p>
                </div>
                <div class="step-field">
                    <span class="step-field-label">Business benefit</span>
                    <p class="step-field-value step-benefit">${step.benefit}</p>
                </div>
            </div>
            <div class="step-metric-badge">${step.metric}</div>
            <div class="step-detail-panel" id="stepDetail${index + 1}" style="display: none;">
                <div class="step-detail-content">
                    <h4>Details</h4>
                    <p>${step.detail}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Toggle step detail panel
function toggleStepDetail(stepNumber) {
    const panel = document.getElementById(`stepDetail${stepNumber}`);
    if (!panel) return;
    
    // Close all other panels
    document.querySelectorAll('.step-detail-panel').forEach(p => {
        if (p.id !== `stepDetail${stepNumber}`) {
            p.style.display = 'none';
            p.closest('.how-it-works-step')?.classList.remove('active');
        }
    });
    
    // Toggle current panel
    const isVisible = panel.style.display !== 'none';
    panel.style.display = isVisible ? 'none' : 'block';
    panel.closest('.how-it-works-step')?.classList.toggle('active', !isVisible);
}

// ============================================
// RENDER FEATURES SECTION
// ============================================
function renderFeaturesSection() {
    const container = document.getElementById('featuresDarkGrid');
    if (!container) return;

    const visualElements = [
        'profile', 'score', 'heatmap', 'code', 'badges', 'calendar', 'chart', 'shield'
    ];

    container.innerHTML = featureCategoriesData.slice(0, 8).map((feature, index) => {
        const visualType = visualElements[index] || 'profile';
        return `
        <div class="feature-dark-card">
            <div class="feature-dark-header">
                <div class="feature-dark-icon-box">${feature.icon}</div>
                <div class="feature-dark-visual">
                    ${getFeatureDarkVisual(visualType)}
                </div>
            </div>
            <div>
                <h3 class="feature-dark-title">${feature.name}</h3>
                <p class="feature-dark-description">${feature.description}</p>
            </div>
        </div>
        `;
    }).join('');
}

function getFeatureDarkVisual(type) {
    switch(type) {
        case 'profile':
            return `
                <div class="feature-dark-visual-profile">
                    <div class="feature-dark-visual-profile-header">
                        <div class="feature-dark-visual-avatar"></div>
                        <div class="feature-dark-visual-name"></div>
                    </div>
                    <div class="feature-dark-visual-lines">
                        <div class="feature-dark-visual-line"></div>
                        <div class="feature-dark-visual-line" style="width: 67%;"></div>
                        <div class="feature-dark-visual-tags">
                            <div class="feature-dark-visual-tag"></div>
                            <div class="feature-dark-visual-tag"></div>
                        </div>
                    </div>
                </div>
            `;
        case 'score':
            return `
                <div class="feature-dark-visual-score">
                    <svg class="feature-dark-score-ring" width="128" height="128" viewBox="0 0 128 128">
                        <circle cx="64" cy="64" r="50" fill="transparent" stroke="currentColor" stroke-width="8" class="feature-dark-score-track"/>
                        <circle cx="64" cy="64" r="50" fill="transparent" stroke="#0083C3" stroke-width="8" 
                                stroke-dasharray="314" stroke-dashoffset="19" transform="rotate(-90 64 64)" class="feature-dark-score-fill"/>
                    </svg>
                    <div class="feature-dark-score-text">
                        <span class="feature-dark-score-value">94%</span>
                        <span class="feature-dark-score-label">Match</span>
                    </div>
                </div>
            `;
        case 'heatmap':
            return `
                <div class="feature-dark-visual-heatmap">
                    <div class="feature-dark-heatmap-grid">
                        ${Array.from({length: 8}, (_, i) => `<div class="feature-dark-heatmap-cell ${i < 4 ? 'active' : ''}" style="opacity: ${[0.2, 0.6, 1, 0.4, 0.8, 0.3, 1, 0.5][i]};"></div>`).join('')}
                    </div>
                </div>
            `;
        case 'code':
            return `
                <div class="feature-dark-visual-code">
                    <div class="feature-dark-code-window">
                        <div class="feature-dark-code-dots">
                            <div class="feature-dark-code-dot" style="background: #ef4444;"></div>
                            <div class="feature-dark-code-dot" style="background: #f59e0b;"></div>
                            <div class="feature-dark-code-dot" style="background: #10b981;"></div>
                        </div>
                        <div class="feature-dark-code-content">
                            <div class="feature-dark-code-line"><span class="code-purple">function</span> <span class="code-blue">assessMatch</span>(c) {</div>
                            <div class="feature-dark-code-line indent">return c.skills.<span class="code-yellow">map</span>(s => {</div>
                            <div class="feature-dark-code-line double-indent"><span class="code-primary">return AI.score(s);</span></div>
                            <div class="feature-dark-code-line indent">});</div>
                            <div class="feature-dark-code-line">}</div>
                        </div>
                    </div>
                </div>
            `;
        case 'badges':
            return `
                <div class="feature-dark-visual-badges">
                    <div class="feature-dark-badge-item" style="background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3);">
                        <div class="feature-dark-badge-dot" style="background: #10b981;"></div>
                        <span>Identity Verified</span>
                    </div>
                    <div class="feature-dark-badge-item">
                        <div class="feature-dark-badge-dot"></div>
                        <span>Active Monitoring</span>
                    </div>
                </div>
            `;
        case 'calendar':
            return `
                <div class="feature-dark-visual-calendar">
                    <div class="feature-dark-calendar-grid">
                        ${Array.from({length: 8}, (_, i) => `<div class="feature-dark-calendar-cell ${[1, 3, 6].includes(i) ? 'active' : ''}"></div>`).join('')}
                    </div>
                </div>
            `;
        case 'chart':
            return `
                <div class="feature-dark-visual-chart">
                    <div class="feature-dark-chart-bars">
                        <div class="feature-dark-chart-bar" style="height: 30%;"></div>
                        <div class="feature-dark-chart-bar" style="height: 50%;"></div>
                        <div class="feature-dark-chart-bar" style="height: 40%;"></div>
                        <div class="feature-dark-chart-bar active" style="height: 80%;"></div>
                        <div class="feature-dark-chart-bar active" style="height: 60%;"></div>
                        <div class="feature-dark-chart-bar active" style="height: 90%;"></div>
                    </div>
                </div>
            `;
        case 'shield':
            return `
                <div class="feature-dark-visual-shield">
                    <div class="feature-dark-shield-content">
                        <div class="feature-dark-shield-line">
                            <span class="feature-dark-shield-label">ENCRYPTED</span>
                            <span>02:14:55</span>
                        </div>
                        <div class="feature-dark-shield-bar"></div>
                        <div class="feature-dark-shield-line">
                            <span>SOC2_AUTH</span>
                            <span class="feature-dark-shield-success">SUCCESS</span>
                        </div>
                        <div class="feature-dark-shield-bar" style="width: 67%;"></div>
                        <div class="feature-dark-shield-line">
                            <span>AES_256</span>
                            <span class="feature-dark-shield-active">ACTIVE</span>
                        </div>
                    </div>
                </div>
            `;
        default:
            return '';
    }
}

let currentStepperStep = 0;

function renderHowItWorksStepperSection() {
    const stepperBar = document.getElementById('stepperBar');
    const detailPanel = document.getElementById('stepperDetailPanel');
    
    if (!stepperBar) {
        console.error('stepperBar element not found');
        return;
    }
    
    if (!detailPanel) {
        console.error('stepperDetailPanel element not found');
        return;
    }
    
    if (!howItWorksStepsData || howItWorksStepsData.length === 0) {
        console.error('howItWorksStepsData is not defined or empty');
        return;
    }

    // Step labels mapping
    const stepLabels = ['INTAKE', 'SOURCE', 'SCREEN', 'MATCHING', 'ASSESS', 'INTERVIEW', 'COMPARE', 'REVIEW', 'OFFER'];
    
    // Step 01-03 are completed, Step 04 is active, Step 05-09 are inactive
    const stepsHTML = howItWorksStepsData.map((step, index) => {
        const isActive = index === 3; // Step 04 (Matching) is active
        const isCompleted = index < 3; // Steps 01-03 are completed
        const isLast = index === howItWorksStepsData.length - 1;
        
        return `
            <div class="stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" onclick="showStepperStep(${index})" data-step="${index}">
                <div class="stepper-step-circle">
                    <span class="stepper-step-number">${step.number}</span>
                </div>
                <div class="stepper-step-label">${stepLabels[index] || step.title.split(' ')[0].toUpperCase()}</div>
                ${!isLast ? '<div class="stepper-step-line"></div>' : ''}
            </div>
        `;
    }).join('');
    
    stepperBar.innerHTML = stepsHTML;
    
    console.log('Stepper rendered with', howItWorksStepsData.length, 'steps');
    console.log('Stepper HTML length:', stepperBar.innerHTML.length);

    updateStepperDetailPanel(currentStepperStep);
}

function showStepperStep(index) {
    if (index < 0 || index >= howItWorksStepsData.length) return;
    currentStepperStep = index;
    renderHowItWorksStepperSection();
}

function updateStepperDetailPanel(stepIndex) {
    const detailPanel = document.getElementById('stepperDetailPanel');
    if (!detailPanel) return;

    const step = howItWorksStepsData[stepIndex];
    if (!step) return;

    detailPanel.innerHTML = `
        <div class="stepper-detail-content">
            <div class="stepper-detail-left">
                <div class="stepper-detail-badge">Step ${step.number}: ${step.title}</div>
                <h2 class="stepper-detail-title">${step.title}</h2>
                <p class="stepper-detail-description">${step.detail || step.description}</p>
                <ul class="stepper-detail-list">
                    <li><span class="stepper-detail-check">✓</span><span>${step.capabilities}</span></li>
                    <li><span class="stepper-detail-check">✓</span><span>${step.actions}</span></li>
                    <li><span class="stepper-detail-check">✓</span><span>${step.benefit}</span></li>
                </ul>
                <div class="stepper-detail-nav">
                    <button class="stepper-nav-btn" onclick="showStepperStep(${stepIndex - 1})" ${stepIndex === 0 ? 'disabled' : ''}>
                        <span>←</span> Previous
                    </button>
                    <button class="stepper-nav-btn stepper-nav-btn-primary" onclick="showStepperStep(${stepIndex + 1})" ${stepIndex === howItWorksStepsData.length - 1 ? 'disabled' : ''}>
                        Next Stage <span>→</span>
                    </button>
                </div>
            </div>
            <div class="stepper-detail-right">
                <div class="stepper-candidate-preview">
                    <div class="stepper-candidate-header">
                        <div class="stepper-candidate-info">
                            <div class="stepper-candidate-avatar">SK</div>
                            <div>
                                <div class="stepper-candidate-name">Sarah Kendrick</div>
                                <div class="stepper-candidate-role">Senior Product Designer</div>
                            </div>
                        </div>
                        <div class="stepper-match-badge">94% MATCH</div>
                    </div>
                    <div class="stepper-score-ring">
                        <svg class="stepper-score-svg" width="192" height="192" viewBox="0 0 192 192">
                            <circle cx="96" cy="96" r="90" fill="transparent" stroke="rgba(255,255,255,0.1)" stroke-width="12"/>
                            <circle cx="96" cy="96" r="90" fill="transparent" stroke="#0083C3" stroke-width="12" 
                                    stroke-dasharray="565" stroke-dashoffset="34" transform="rotate(-90 96 96)"/>
                        </svg>
                        <div class="stepper-score-content">
                            <span class="stepper-score-value">94</span>
                            <span class="stepper-score-label">AI Score</span>
                        </div>
                    </div>
                    <div class="stepper-capabilities">
                        <div class="stepper-capabilities-label">Top Capabilities</div>
                        <div class="stepper-capabilities-tags">
                            <span class="stepper-capability-tag">Design Systems (9/10)</span>
                            <span class="stepper-capability-tag">React Native (8/10)</span>
                            <span class="stepper-capability-tag">Figma Expert</span>
                            <span class="stepper-capability-tag stepper-capability-tag-primary">Strategic Thinking</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// PRICING LEAD FORM HANDLER
// ============================================
function handlePricingLeadSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const emailInput = form.querySelector('#pricing-email');
    const submitButton = form.querySelector('#pricingSubmitBtn');
    
    // Validate required fields
    if (!emailInput.value.trim()) {
        emailInput.focus();
        emailInput.style.borderColor = '#ef4444';
        setTimeout(() => {
            emailInput.style.borderColor = '';
        }, 2000);
        return;
    }
    
    // Show loading state
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    
    // Simulate API call
    setTimeout(() => {
        const formData = {
            email: emailInput.value,
            volume: form.querySelector('#pricing-volume').value
        };
        
        console.log('Pricing lead form submitted:', formData);
        
        if (typeof trackEvent === 'function') {
            trackEvent('pricing_lead_submit', formData);
        }
        
        // Open setup email modal
        if (typeof openSetupEmailModal === 'function') {
            openSetupEmailModal();
        }
        
        // Reset form
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        form.reset();
    }, 1000);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing stepper...');
    
    // Try rendering immediately
    renderHowItWorksStepperSection();
    
    // Also try after a short delay in case elements aren't ready
    setTimeout(function() {
        console.log('Retrying stepper render...');
        renderHowItWorksStepperSection();
    }, 100);
    
    renderFeaturesSection();
    
    // Initialize testimonials scroll
    if (typeof initTestimonialsScroll === 'function') {
        initTestimonialsScroll();
    }
    
    // Test functions - remove these after testing
    window.testSubscribe = function() {
        console.log('Testing subscribe function...');
        const form = document.getElementById('subscribeForm');
        if (form) {
            const emailInput = form.querySelector('#subscribeEmail');
            if (emailInput) {
                emailInput.value = 'test@example.com';
                handleSubscribeSubmit({ target: form, preventDefault: () => {} });
            }
        }
    };
    
    window.testModal = function() {
        console.log('Testing modal function...');
        openSetupEmailModal();
    };
    
    console.log('Test functions available: testSubscribe() and testModal()');
    
    // Test validateEmail function
    console.log('Testing validateEmail function:');
    console.log('test@example.com:', validateEmail('test@example.com'));
    console.log('invalid-email:', validateEmail('invalid-email'));
    console.log('validateEmail function exists:', typeof validateEmail);
});

// ============================================
// EXIT-INTENT MODAL FUNCTIONS
// ============================================
function openExitIntentModal() {
    const modal = document.getElementById('exitIntentModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first input for accessibility
        const emailInput = modal.querySelector('input[type="email"]');
        if (emailInput) {
            setTimeout(() => emailInput.focus(), 100);
        }
        
        // Trap focus inside modal
        trapFocus(modal);
    }
}

function closeExitIntentModal() {
    const modal = document.getElementById('exitIntentModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset form
        const form = document.getElementById('exitIntentForm');
        const successDiv = document.getElementById('exitIntentSuccess');
        if (form) {
            form.style.display = 'block';
            form.reset();
        }
        if (successDiv) {
            successDiv.style.display = 'none';
        }
    }
}

// ============================================
// SETUP EMAIL MODAL FUNCTIONS
// ============================================
function openSetupEmailModal() {
    const modal = document.getElementById('setupEmailModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        const emailInput = modal.querySelector('#setup-email');
        if (emailInput) {
            setTimeout(() => emailInput.focus(), 100);
        }
    }
}

function closeSetupEmailModal() {
    const modal = document.getElementById('setupEmailModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        const form = document.getElementById('setupEmailForm');
        const successDiv = document.getElementById('setupEmailSuccess');
        if (form) {
            form.style.display = 'block';
            form.reset();
        }
        if (successDiv) {
            successDiv.style.display = 'none';
        }
    }
}

function handleSetupEmailSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const emailInput = form.querySelector('input[type="email"]');
    const submitButton = form.querySelector('button[type="submit"]');
    const btnText = submitButton.querySelector('.btn-text');
    const btnLoading = submitButton.querySelector('.btn-loading');
    const successDiv = document.getElementById('setupEmailSuccess');
    const email = emailInput.value.trim();

    if (!validateEmail(email)) {
        emailInput.focus();
        emailInput.style.borderColor = '#ef4444';
        setTimeout(() => {
            emailInput.style.borderColor = '';
        }, 2000);
        return;
    }

    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    submitButton.disabled = true;

    setTimeout(() => {
        console.log('Setup email captured:', email);

        if (typeof trackEvent === 'function') {
            trackEvent('setup_email_submit', {
                form_type: 'setup_modal',
                email: email
            });
        }

        // Hide form, show success
        form.style.display = 'none';
        if (successDiv) {
            successDiv.style.display = 'block';
        }
        
        // Reset button state
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        submitButton.disabled = false;

        // Optional: Reset form after 5 seconds
        setTimeout(() => {
            form.style.display = 'block';
            form.reset();
            successDiv.style.display = 'none';
        }, 5000);
    }, 1500);
}

// ============================================
// EXIT-INTENT FORM HANDLER
// ============================================
function handleExitIntentSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const emailInput = form.querySelector('input[type="email"]');
    const submitButton = form.querySelector('button[type="submit"]');
    const btnText = submitButton.querySelector('.btn-text');
    const btnLoading = submitButton.querySelector('.btn-loading');
    const successDiv = document.getElementById('exitIntentSuccess');
    const email = emailInput.value.trim();
    
    if (!validateEmail(email)) {
        emailInput.focus();
        emailInput.style.borderColor = '#ef4444';
        setTimeout(() => {
            emailInput.style.borderColor = '';
        }, 2000);
        return;
    }

    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    submitButton.disabled = true;

    setTimeout(() => {
        console.log('Exit-intent email captured:', email);

        if (typeof trackEvent === 'function') {
            trackEvent('exit_intent_submit', {
                form_type: 'exit_intent',
                email: email
            });
        }

        // Hide form, show success
        form.style.display = 'none';
        if (successDiv) {
            successDiv.style.display = 'block';
        }
        
        // Reset button state
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        submitButton.disabled = false;

        // Optional: Reset form after 5 seconds
        setTimeout(() => {
            form.style.display = 'block';
            form.reset();
            successDiv.style.display = 'none';
        }, 5000);
    }, 1500);
}

// ============================================
// FOCUS TRAPPING FOR ACCESSIBILITY
// ============================================
function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    modal.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        }
    });
    
    firstFocusable.focus();
}

