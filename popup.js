const urlInput = document.getElementById("urlInput");
const addBtn = document.getElementById("addBtn");
const blockedList = document.getElementById("blockedList");

function renderBlockedList(urls) {
    blockedList.innerHTML = "";
    urls.forEach((url) => {
        const li = document.createElement("li");
        li.textContent = url;
        blockedList.appendChild(li);
    });
}

chrome.storage.sync.get({ blockedUrls: [] }, (data) => {
    renderBlockedList(data.blockedUrls);
});

addBtn.addEventListener("click", () => {
    const url = urlInput.value.trim();
    if (!url) return;
    chrome.storage.sync.get({ blockedUrls: [] }, (data) => {
        const updated = [...data.blockedUrls, url];
        chrome.storage.sync.set({ blockedUrls: updated }, () => {
            renderBlockedList(updated);
            urlInput.value = "";
            alert(url + " added to blocked list!");
        });
    });
});