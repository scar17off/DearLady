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
                <img src="https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=56" width="56" height="56" alt="logo">
                <label>${guild.name}</label>
            `;
            serverDiv.addEventListener('click', function() {
                document.getElementById('content').textContent = 'Content for ' + guild.name;
            });
            serverList.appendChild(serverDiv);
        });

        const tabs = document.querySelectorAll('#tab-list > div');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                document.getElementById('content').textContent = 'Content for ' + tab.textContent;
            });
        });
    })
    .catch(error => console.error('Error fetching user data:', error));
}
