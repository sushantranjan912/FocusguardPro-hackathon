const blockedUrlsList = document.getElementById("blockedUrls");

function renderBlockedUrls(urls) {
    blockedUrlsList.innerHTML = "";
    urls.forEach((url, index) => {
        const li = document.createElement("li");
        li.textContent = url;
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.onclick = () => removeUrl(index);
        li.appendChild(removeBtn);
        blockedUrlsList.appendChild(li);
    });
}

function removeUrl(index) {
    chrome.storage.sync.get({ blockedUrls: [] }, (data) => {
        data.blockedUrls.splice(index, 1);
        chrome.storage.sync.set({ blockedUrls: data.blockedUrls }, () => {
            renderBlockedUrls(data.blockedUrls);
        });
    });
}

chrome.storage.sync.get({ blockedUrls: [] }, (data) => {
    renderBlockedUrls(data.blockedUrls);
});