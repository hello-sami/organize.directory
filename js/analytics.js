// Minimal Analytics Implementation
const Analytics = {
    initialized: false,
    queue: [],
    maxRetries: 3,
    retryTimeout: 1000,

    init() {
        if (this.initialized) return;
        this.setupAnalytics()
            .then(() => {
                this.initialized = true;
                this.processQueue();
            })
            .catch(error => {
                console.warn('Analytics initialization warning:', error);
                // Still mark as initialized to prevent retries
                this.initialized = true;
            });
    },

    async setupAnalytics() {
        try {
            const params = new URLSearchParams({
                path: window.location.pathname,
                referrer: document.referrer,
                timestamp: new Date().toISOString()
            });

            const response = await fetch(`/analytics/init?${params}`, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                // Log warning but don't throw error
                console.warn('Analytics endpoint not available, falling back to client-side tracking');
                return true;
            }
            
            console.log('Analytics initialized');
            return true;
        } catch (error) {
            console.warn('Analytics setup warning:', error);
            return true; // Don't fail initialization
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
        // Convert data to URL parameters for GET request
        const params = new URLSearchParams(data).toString();
        const getUrl = `${url}?${params}`;
        
        try {
            const response = await fetch(getUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'same-origin'
            });
            
            if (!response.ok) {
                console.warn(`Analytics request warning: ${response.status}`);
                return true; // Don't fail analytics
            }
            
            return true;
        } catch (error) {
            console.warn('Analytics request failed:', error);
            return true; // Don't fail analytics
        }
    }
};

// Initialize analytics
Analytics.init();

// Export for use in other modules
export default Analytics; 