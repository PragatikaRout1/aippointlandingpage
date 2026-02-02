// Common Header and Footer Components
// This file loads header and footer from separate HTML files

(function() {
    'use strict';
    
    async function loadHeader() {
        // Check if header already exists to avoid duplicates
        if (document.getElementById('navbar')) {
            return;
        }
        
        try {
            const response = await fetch('header.html');
            const headerHTML = await response.text();
            
            // Extract the body content from header.html (includes nav + chatbot modal + script)
            const parser = new DOMParser();
            const doc = parser.parseFromString(headerHTML, 'text/html');
            const bodyContent = doc.querySelector('body').innerHTML;
            
            // Insert header content at the beginning of body
            if (document.body) {
                document.body.insertAdjacentHTML('afterbegin', bodyContent);
            }
        } catch (error) {
            console.error('Error loading header:', error);
        }
    }

    async function loadFooter() {
        // Check if footer already exists to avoid duplicates
        if (document.querySelector('footer.footer')) {
            return;
        }
        
        try {
            const response = await fetch('footer.html');
            const footerHTML = await response.text();
            
            // Extract only the footer content from footer.html
            const parser = new DOMParser();
            const doc = parser.parseFromString(footerHTML, 'text/html');
            const footerContent = doc.querySelector('footer').outerHTML;
            
            // Insert footer before closing body tag
            if (document.body) {
                document.body.insertAdjacentHTML('beforeend', footerContent);
            }
        } catch (error) {
            console.error('Error loading footer:', error);
        }
    }

    // Initialize mobile menu functionality
    // Note: Enhanced mobile menu initialization is handled in script.js
    // This is a fallback that will be overridden by script.js if available
    function initializeMobileMenu() {
        // Try to use the enhanced version from script.js if available
        if (typeof window.initializeMobileMenu === 'function') {
            window.initializeMobileMenu();
            return;
        }
        
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.getElementById('navMenu');
        const navMenuBackdrop = document.getElementById('navMenuBackdrop');

        if (menuToggle && navMenu) {
            function toggleMenu() {
                const isActive = navMenu.classList.contains('active');
                
                if (isActive) {
                    menuToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    if (navMenuBackdrop) navMenuBackdrop.classList.remove('active');
                    document.body.classList.remove('menu-open');
                    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
                } else {
                    menuToggle.classList.add('active');
                    navMenu.classList.add('active');
                    if (navMenuBackdrop) navMenuBackdrop.classList.add('active');
                    document.body.classList.add('menu-open');
                    menuToggle.setAttribute('aria-expanded', 'true');
                }
            }
            
            menuToggle.addEventListener('click', toggleMenu);
            
            if (navMenuBackdrop) {
                navMenuBackdrop.addEventListener('click', toggleMenu);
            }

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

    // Load proactive chatbot
    async function loadProactiveChatbot() {
        // Check if proactive chatbot already exists
        if (document.getElementById('proactiveChatbot')) {
            return;
        }
        
        try {
            const response = await fetch('proactive-chatbot.html');
            const chatbotHTML = await response.text();
            
            // Extract the chatbot content
            const parser = new DOMParser();
            const doc = parser.parseFromString(chatbotHTML, 'text/html');
            const chatbotContent = doc.querySelector('.proactive-chatbot');
            
            if (chatbotContent && document.body) {
                // Insert chatbot before closing body tag
                document.body.insertAdjacentHTML('beforeend', chatbotContent.outerHTML);
                
                // Also insert the script and style if they exist
                const script = doc.querySelector('script');
                const style = doc.querySelector('style');
                
                if (script && script.textContent) {
                    const scriptEl = document.createElement('script');
                    scriptEl.textContent = script.textContent;
                    document.body.appendChild(scriptEl);
                }
                
                if (style && style.textContent) {
                    const styleEl = document.createElement('style');
                    styleEl.textContent = style.textContent;
                    document.head.appendChild(styleEl);
                }
            }
        } catch (error) {
            console.error('Error loading proactive chatbot:', error);
        }
    }

    // Load header and footer when DOM is ready
    async function init() {
        if (document.body) {
            await Promise.all([
                loadHeader(),
                loadFooter(),
                loadProactiveChatbot()
            ]);
            
            // Initialize mobile menu after header is loaded
            initializeMobileMenu();
            
            // Check if chatbot functions are available
            if (typeof window.openChatbot === 'function') {
                console.log('Chatbot functions loaded successfully');
            } else {
                console.log('Chatbot functions not yet available');
            }
        } else {
            // Wait for body to be available
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
            } else {
                // Use setTimeout as fallback
                setTimeout(init, 0);
            }
        }
    }

    // Initialize immediately if possible, otherwise wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

