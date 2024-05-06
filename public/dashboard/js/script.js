window.onload = function() {
    fetch('/get-user')
    .then(response => response.json())
    .then(data => {
        const usernameSpan = document.getElementById('username');
        usernameSpan.textContent = data.username;
    })
    .catch(error => console.error('Error fetching user data:', error));
}