import { AllData } from "../types";


const setIncidentData = (data: AllData) => {
    console.log("SET:", data);
    chrome.storage.local.set({ incidentData: data }, () => {
        if (chrome.runtime.lastError) {
            console.error("Error setting incidentData:", chrome.runtime.lastError);
        } else {
            // show notification
            const notificationOptions: any = {
                type: 'basic',
                iconUrl: 'img/logo-16.png',
                title: 'Incident Data Updated',
                message: 'The incident data has been updated.'
            };

            chrome.notifications.create('incidentDataUpdated', notificationOptions, (notificationId) => {
                console.log('Notification created:', notificationId);
            
            });
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

