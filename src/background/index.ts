import { AllData } from "../types";

const setIncidentData = (data: AllData) => {
    console.log("SET:", data);
    chrome.storage.local.set({ incidentData: data }, () => {
        if (chrome.runtime.lastError) {
            console.error("Error setting incidentData:", chrome.runtime.lastError);
        } else {
            // Open the popup programmatically
            chrome.action.setPopup({ popup: 'popup.html' });
        }
    });
};

const getIncidentData = (sendResponse: (response: AllData | null) => void) => {
    chrome.storage.local.get('incidentData', (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error getting incidentData:", chrome.runtime.lastError);
            sendResponse(null);
        } else {
            console.log("GET:", result.incidentData);
            sendResponse(result.incidentData);
        }
    });
};

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'setIncidentData') {
        setIncidentData(message.data);
    } else if (message.type === 'getIncidentData') {
        getIncidentData(sendResponse);
        // Return true to indicate you want to send a response asynchronously
        return true;
    }
});
