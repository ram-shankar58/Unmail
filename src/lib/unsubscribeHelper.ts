export const handleUnsubscribe = () => {
    try{
        const unsubscribeLinks= [
            ...document.querySelectorAll<HTMLAnchorElement>('a[href*="unsubscribe"], span:has-text(unsubscribe)')
        ]

        const listUnsubscribeHeaders=Array.from(document.querySelectorAll('div[role="listitem"]')).map(item => {
            const headers = item.innerHTML.match(/List-Unsubscribe: <(.*)>/)   
            return headers ? headers[1] : null
        })
        .filter(Boolean)

        const allTargets=[...unsubscribeLinks, ...listUnsubscribeHeaders]

        allTargets.forEach(targett=>{
            if (typeof targett==='string'){ //handle all list-unsubscribe POST requests
                fetch(targett, {method : 'POST'})
            }
            else if(targett.href){
                //handle the usual links type
                const iframe = document.createElement('iframe')
                iframe.style.display='none'
                iframe.src=targett?.href
                document.body.appendChild(iframe)
            }
        })
        return {
            success : true,
            count: allTargets.length,
            processed: allTargets.map(t=> typeof t === 'string' ? t: t.href)

        }
    }
    catch (error){
        return{
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}