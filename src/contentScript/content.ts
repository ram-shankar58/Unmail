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