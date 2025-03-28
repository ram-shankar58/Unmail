chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action === 'initiateUnsubscribe'){
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab=tabs[0]
            if(tab.id){
                chrome.scripting.executeScript({
                    target: {tabId: tab.id},
                    func: () => {
                        return (document.querySelector('div[role="main"]')?.innerHTML || ' ').includes('@')
                    }

                }, ([result]) => {
                    if(result.result){
                        chrome.tabs.sendMessage(tab.id!, {action:'findAndProcessUnsubscribe'}, response=>{
                            sendResponse(response)
                        })
                    }
                    else{
                        sendResponse({ERROR: 'NOT A VALID EMAIL VIEW'})
                    } })
            }
    })
    return true
} 
})      