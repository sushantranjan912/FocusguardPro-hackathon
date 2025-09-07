// This listener runs once when the extension is installed.
chrome.runtime.onInstalled.addListener(() => {
    console.log("FocusGuard installed");
});

// This listener is the bridge from your website to your extension.
// It listens for messages sent from your website's `chrome.runtime.sendMessage`.
chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
        // 🛡️ Security Check: Always verify the sender's URL.
        // The allowed origin must match the protocol and host from your website.
        const allowedOrigin = "http://127.0.0.1:5500";
        if (!sender.url || !sender.url.startsWith(allowedOrigin)) {
            sendResponse({status: "error", message: "Invalid sender."});
            return;
        }
        
        console.log("Received message from website with action:", request.action);
        
        switch (request.action) {
            case "startFocusSession":
                // Get the list of sites from the message data.
                const sitesToBlock = request.data.blockedSites;
                
                // Store the list in chrome.storage.
                // This will automatically trigger the `chrome.storage.onChanged` listener below.
                chrome.storage.sync.set({ blockedUrls: sitesToBlock }, () => {
                    console.log("Focus session started. Blocking sites:", sitesToBlock);
                    sendResponse({status: "success", message: "Blocking rules applied."});
                });
                break;
                
            case "stopFocusSession":
                // Clear the blocked list by saving an empty array to storage.
                // This triggers the `onChanged` listener to remove all rules.
                chrome.storage.sync.set({ blockedUrls: [] }, () => {
                    console.log("Focus session stopped. Blocking rules cleared.");
                    sendResponse({status: "success", message: "Blocking rules cleared."});
                });
                break;
                
            default:
                sendResponse({status: "error", message: "Unknown action."});
                break;
        }

        // Return `true` to indicate that `sendResponse` will be called asynchronously.
        // This is necessary because `chrome.storage.sync.set` is an async operation.
        return true;
    }
);

// This listener is automatically triggered whenever `blockedUrls` is updated in storage,
// whether it's from the website or another part of your extension.
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.blockedUrls) {
        console.log("Storage change detected. Updating rules.");
        updateRules(changes.blockedUrls.newValue);
    }
});

// This function updates the dynamic blocking rules using the declarativeNetRequest API.
function updateRules(urls) {
    chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
        const removeRuleIds = existingRules.map(rule => rule.id);
        
        const newRules = urls.map((url, index) => ({
            id: index + 1,
            priority: 1,
            action: { type: "block" },
            condition: { urlFilter: url, resourceTypes: ["main_frame"] }
        }));
        
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: removeRuleIds,
            addRules: newRules
        }, () => {
             if (chrome.runtime.lastError) {
                 console.error("Failed to update rules:", chrome.runtime.lastError);
             } else {
                 console.log("Declarative Net Request rules updated successfully.");
             }
        });
    });
}
