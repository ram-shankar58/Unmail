// Enhanced Gmail unsubscribe detector
class GmailUnsubscriber {
    static patterns = [
      /unsubscribe/i,
      /opt.?out/i,
      /email.?preferences/i,
      /manage.?subscriptions?/i,
      /notification.?settings/i,
      /email.?settings/i,
      /subscription.?center/i,
      /preference.?center/i,
      /remove.?me/i,
      /stop.?emails/i
    ];
  
    static findLinks() {
      // 1. Check for Gmail's native unsubscribe
      const nativeUnsub = this.checkNativeUnsubscribe();
      if (nativeUnsub) return [nativeUnsub];
  
      // 2. Find all potential links in email body
      const emailBody = document.querySelector('[role="article"]') || document.body;
      const allLinks = Array.from(emailBody.querySelectorAll('a'));
      
      // 3. Filter links matching our patterns
      const potentialLinks = allLinks.filter(link => {
        const href = (link.href || '').toLowerCase();
        const text = (link.textContent || '').toLowerCase();
        const aria = (link.getAttribute('aria-label') || '').toLowerCase();
        
        return this.patterns.some(pattern => 
          pattern.test(href) || 
          pattern.test(text) || 
          pattern.test(aria)
        );
      }).map(link => ({
        element: link,
        url: link.href,
        type: 'link'
      }));
  
      // 4. Check email headers
      const headerLinks = this.checkEmailHeaders();
      
      return [...potentialLinks, ...headerLinks];
    }
  
    static checkNativeUnsubscribe() {
      const nativeBtn = document.querySelector('[data-unsubscribe], [aria-label*="unsubscribe"]');
      if (!nativeBtn) return null;
      
      return {
        element: nativeBtn,
        url: nativeBtn.getAttribute('data-unsubscribe') || window.location.href,
        type: 'gmail_native'
      };
    }
  
    static checkEmailHeaders() {
      const results = [];
      const emailSource = document.documentElement.innerHTML;
      
      // List-Unsubscribe headers
      const headerPatterns = [
        /List-Unsubscribe:\s*<([^>]+)>/i,
        /List-Unsubscribe:\s*([^<>\s]+)/i,
        /unsubscribe_url=["']([^"']+)["']/i
      ];
      
      headerPatterns.forEach(pattern => {
        const matches = emailSource.match(pattern);
        if (matches?.[1]) {
          results.push({
            url: matches[1],
            type: 'header'
          });
        }
      });
      
      return results;
    }
  
    static async processUnsubscribe(item) {
      try {
        // Handle Gmail native button
        if (item.type === 'gmail_native') {
          item.element.click();
          await new Promise(resolve => setTimeout(resolve, 1000));
          return true;
        }
        
        // Try POST with form data
        const postSuccess = await fetch(item.url, {
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: 'action=unsubscribe&email=user@example.com'
        }).then(res => res.ok)
          .catch(() => false);
        
        if (postSuccess) return true;
        
        // Fallback to GET
        return await fetch(item.url, {method: 'GET'})
          .then(res => res.ok)
          .catch(() => false);
      } catch (error) {
        console.error('Unsubscribe failed:', error);
        return false;
      }
    }
  }
  
  // Message handler
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'findAndProcessUnsubscribe') {
      (async () => {
        const items = GmailUnsubscriber.findLinks();
        
        if (items.length === 0) {
          sendResponse({
            success: false,
            error: 'No unsubscribe links found',
            count: 0,
            processed: []
          });
          return;
        }
        
        const results = [];
        for (const item of items) {
          if (await GmailUnsubscriber.processUnsubscribe(item)) {
            results.push(item.url);
          }
        }
        
        sendResponse({
          success: results.length > 0,
          count: results.length,
          processed: results,
          error: results.length === 0 ? 'Failed to process any links' : undefined
        });
      })();
      
      return true; // Keep message channel open
    }
  });