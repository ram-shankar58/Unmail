const handleUnsubscribe = async (sendResponse) => {
    try {
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      
      if (!tab?.id) {
        throw new Error('No active Gmail tab found');
      }
  
      // First try direct communication
      try {
        const response = await chrome.tabs.sendMessage(
          tab.id, 
          {action: 'findAndProcessUnsubscribe'}
        );
        sendResponse(response || {success: false, error: 'No response'});
        return;
      } catch (directError) {
        console.log('Direct communication failed, injecting script...');
      }
  
      // Injection fallback
      await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ['src/contentScript/content.js']
      });
  
      // Retry after injection
      const response = await chrome.tabs.sendMessage(
        tab.id,
        {action: 'findAndProcessUnsubscribe'},
        // Timeout after 5 seconds
        {timeout: 5000}
      );
  
      sendResponse(response || {success: false, error: 'No response after injection'});
    } catch (error) {
      sendResponse({
        success: false,
        error: error.message || 'Background script error'
      });
    }
  };
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'initiateUnsubscribe') {
      handleUnsubscribe(sendResponse);
      return true; // Keep message channel open
    }
  });