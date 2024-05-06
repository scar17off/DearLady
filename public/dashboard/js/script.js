window.onload = function() {
    fetch('/get-user')
    .then(response => response.json())
    .then(user => {
        const serverList = document.getElementById('server-list');
        user.guilds.forEach(guild => {
            if(!guild.owner) return;
            const serverDiv = document.createElement('div');
            serverDiv.className = 'server';
            serverDiv.innerHTML = `
                <img src="https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=56" width="56" height="56" alt="logo">
                <label>${guild.name}</label>
            `;
            serverDiv.addEventListener('click', function() {
                // Remove active class from any previously active server
                const activeServer = document.querySelector('.server.active');
                if (activeServer) {
                    activeServer.classList.remove('active');
                }
                // Add active class to the clicked server
                serverDiv.classList.add('active');

                const firstTab = document.querySelector('#tab-list > div[id^="tab-"]:not(#tab-list-header)');
                if (firstTab) {
                    document.getElementById('content').innerHTML = document.getElementById('tab-content-' + firstTab.id.split('-')[1]).innerHTML;
                }
                document.getElementById('server-name').innerHTML = guild.name;
                document.getElementById('server-icon').src = serverDiv.getElementsByTagName("img")[0].src.replace("56", "96");
                if(document.getElementById("tab-list").hidden) document.getElementById("tab-list").hidden = false;
            });
            serverDiv.setAttribute('id', `${guild.id}`);
            serverList.appendChild(serverDiv);
        });

        const tabs = document.querySelectorAll('#tab-list > div[id^="tab-"]:not(#tab-list-header)');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                document.getElementById('content').innerHTML = document.getElementById('tab-content-' + tab.id.split('-')[1]).innerHTML;
            });
        });
    })
    .catch(error => console.error('Error fetching user data:', error));
}

function getServerId() {
    const activeServer = document.querySelector('.server.active');
    return activeServer ? activeServer.id : null;
}

function handleCheckboxChange(event) {
    const checkbox = event.target;
    const serverId = getServerId();
    const key = checkbox.name;
    const value = checkbox.checked ? 1 : 0;

    if (!serverId) {
        console.error('No server selected');
        return;
    }

    fetch('/update-server-config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serverId, configKey: key, configValue: value })
    })
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Failed to update server config:', error));
}