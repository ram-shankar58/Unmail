//contents.ts is the content script that runs in the context of the web page. It listens for messages from the background script and performs the necessary actions.

import { handleUnsubscribe } from '../lib/unsubscribeHelper'

chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>{
    if (request.action === 'findAndProcessUnsubscribe'){
        const result=handleUnsubscribe()
        sendResponse({result})
    }
    return true
})

//check mails periodically
setInterval(()=>{
    handleUnsubscribe()
}, 10000)