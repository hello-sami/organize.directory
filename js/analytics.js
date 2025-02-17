// Minimal Analytics Implementation
const Analytics = {
    initialized: false,
    queue: [],
    maxRetries: 3,
    retryTimeout: 1000,

    init() {
        if (this.initialized) return;
        
        // Only initialize when user interacts or after 3 seconds
        const initAnalytics = () => {
            if (this.initialized) return;
            this.initialized = true;
            this.setupAnalytics()
                .then(() => this.processQueue())
                .catch(error => {
                    console.error('Failed to initialize analytics:', error);
                    this.initialized = false;
                    // Retry initialization after timeout
                    setTimeout(() => this.init(), this.retryTimeout);
                });
        };

        // Initialize on user interaction
        const userEvents = ['click', 'scroll', 'keydown'];
        const handleUserInteraction = () => {
            if (!this.initialized) {
                initAnalytics();
                // Remove event listeners after initialization
                userEvents.forEach(event => 
                    window.removeEventListener(event, handleUserInteraction)
                );
            }
        };

        userEvents.forEach(event => 
            window.addEventListener(event, handleUserInteraction, { passive: true })
        );

        // Fallback initialization after 3 seconds
        setTimeout(() => {
            if (!this.initialized) initAnalytics();
        }, 3000);
    },

    async setupAnalytics() {
        try {
            // Add your actual analytics setup code here
            // This is where you would initialize your analytics service
            await this.sendBeacon('/analytics/init');
            console.log('Analytics initialized');
        } catch (error) {
            console.error('Analytics setup failed:', error);
            throw error;
        }
    },

    async trackEvent(category, action, label, retryCount = 0) {
        const event = { category, action, label };
        
        if (!this.initialized) {
            this.queue.push(event);
            return;
        }

        try {
            await this.sendBeacon('/analytics/event', event);
            console.log('Track event:', event);
        } catch (error) {
            console.error('Failed to track event:', error);
            if (retryCount < this.maxRetries) {
                setTimeout(() => {
                    this.trackEvent(category, action, label, retryCount + 1);
                }, this.retryTimeout * (retryCount + 1));
            } else {
                // Store failed events for later retry
                this.queue.push(event);
            }
        }
    },

    async trackPageView(path, retryCount = 0) {
        if (!this.initialized) {
            this.queue.push({ type: 'pageview', path });
            return;
        }

        try {
            await this.sendBeacon('/analytics/pageview', { path });
            console.log('Track pageview:', path);
        } catch (error) {
            console.error('Failed to track pageview:', error);
            if (retryCount < this.maxRetries) {
                setTimeout(() => {
                    this.trackPageView(path, retryCount + 1);
                }, this.retryTimeout * (retryCount + 1));
            } else {
                this.queue.push({ type: 'pageview', path });
            }
        }
    },

    async processQueue() {
        while (this.queue.length > 0) {
            const event = this.queue.shift();
            try {
                if (event.type === 'pageview') {
                    await this.trackPageView(event.path);
                } else {
                    await this.trackEvent(event.category, event.action, event.label);
                }
            } catch (error) {
                console.error('Failed to process queued event:', error);
                // Put the event back in the queue
                this.queue.unshift(event);
                break;
            }
        }
    },

    async sendBeacon(url, data = {}) {
        if ('sendBeacon' in navigator && !data.retry) {
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            return navigator.sendBeacon(url, blob);
        }
        
        // Fallback to fetch if sendBeacon is not available or for retries
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            keepalive: true
        });
        
        if (!response.ok) {
            throw new Error(`Analytics request failed: ${response.status}`);
        }
        
        return true;
    }
};

// Initialize analytics
Analytics.init();

// Export for use in other modules
export default Analytics; 