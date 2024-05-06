window.onload = function() {
    fetch('/bot-status')
    .then(response => response.json())
    .then(data => {
        document.getElementById('status').textContent = `watching over ${data.servers} servers, ${data.members} members`;
    })
    .catch(error => console.error('Error fetching bot status:', error));
}