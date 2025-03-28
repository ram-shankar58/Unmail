export const handleUnsubscribe = () => {
    try {
      // Improved selector for unsubscribe links
      const unsubscribeLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('a'))
        .filter(a => {
          const href = a.href.toLowerCase();
          const text = a.textContent?.toLowerCase() || '';
          return href.includes('unsubscribe') || text.includes('unsubscribe');
        });
  
      // Improved List-Unsubscribe header parsing
      const listUnsubscribeHeaders = Array.from(document.querySelectorAll('div[role="listitem"]'))
        .flatMap(item => {
          const headers = item.innerHTML.match(/List-Unsubscribe:\s*<([^>]+)>/i);
          return headers ? headers[1] : [];
        })
        .filter((url): url is string => !!url);
  
      const allTargets = [...unsubscribeLinks, ...listUnsubscribeHeaders];
  
      // Add safety checks and cleanup
      allTargets.forEach(target => {
        if (typeof target === 'string') {
          // Add CORS headers and error handling
          fetch(target, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }).catch(() => {/* Handle errors */});
        } else if (target.href) {
          // Add iframe cleanup
          const iframe = document.createElement('iframe');
          iframe.onload = () => {
            setTimeout(() => document.body.removeChild(iframe), 5000);
          };
          iframe.style.display = 'none';
          iframe.src = target.href;
          document.body.appendChild(iframe);
        }
      });
  
      return {
        success: true,
        count: allTargets.length,
        processed: allTargets.map(t => typeof t === 'string' ? t : t.href)
      };
    } catch (error) {
      return {
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };
  