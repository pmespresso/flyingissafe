let incidentData: any = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'incidentData') {
        incidentData = message.data;
        
        // Open the popup programmatically
        chrome.browserAction.setPopup({ popup: 'popup.html' });
    } else if (message.type === 'getIncidentData') {
        sendResponse(incidentData);
    }
});