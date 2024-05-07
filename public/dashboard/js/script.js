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

                // Load server config when a server is selected
                fetch(`/get-server-config?serverId=${guild.id}`)
                .then(response => response.json())
                .then(config => {
                    document.querySelectorAll('.checkbox-input').forEach(input => {
                        input.checked = config[input.name] === 1;
                    });
                })
                .catch(error => console.error('Failed to load server config:', error));
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

document.querySelectorAll('.checkbox-input').forEach(input => {
    console.log(input);
    input.addEventListener('change', () => {
        handleCheckboxChange(input);
    });
});

function handleCheckboxChange(input) {
    console.log(input);
    const serverId = getServerId();
    const key = input.parentNode.getAttribute('name');
    const value = input.checked ? 1 : 0;

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