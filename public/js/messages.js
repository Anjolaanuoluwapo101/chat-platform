document.getElementById('messageForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var formData = new FormData(this);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '../public/submit_message.php', true);

    xhr.onload = function() {
        if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.success) {
                document.getElementById('successMessage').style.display = 'block';
                document.getElementById('messageText').value = '';
                // Clear the file input
                document.querySelector('input[type="file"]').value = '';
            } else {
                alert('Error: ' + response.error);
            }
        } else {
            alert('Error: ' + xhr.statusText);
        }
    };

    xhr.send(formData);
});
