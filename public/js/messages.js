
/**
 * MessageFormHandler class handles form submission for both individual and group messages.
 * Supports different submission URIs based on message type.
 */
class MessageFormHandler {
    constructor(submitUri) {
        this.submitUri = submitUri;
        this.init();
    }

    /**
     * Initializes the form event listener.
     */
    init() {
        const messageForm = document.getElementById('messageForm');
        if (messageForm) {
            messageForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    /**
     * Handles form submission via AJAX.
     * @param {Event} e - The submit event.
     */
    handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', this.submitUri, true);

        xhr.onload = () => {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        this.showSuccess();
                        this.clearForm();
                    } else {
                        alert('Error: ' + (response.error || 'Unknown error'));
                    }
                } catch (error) {
                    console.error('Error parsing response:', error);
                    alert('Error: Invalid response from server');
                }
            } else {
                alert('Error: ' + xhr.statusText);
            }
        };

        xhr.onerror = () => {
            alert('Network error occurred');
        };

        xhr.send(formData);
    }

    /**
     * Shows the success message.
     */
    showSuccess() {
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.style.display = 'block';
        }
    }

    /**
     * Clears the form fields after successful submission.
     */
    clearForm() {
        const messageText = document.getElementById('messageText');
        if (messageText) {
            messageText.value = '';
        }

        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.value = '';
        }
    }
}

// Initialize the MessageFormHandler when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // For individual messages (messages.php)
    if (window.location.pathname.includes('/messages.php')) {
        new MessageFormHandler('/submit_message.php');
    }
    // For group messages (group_messages.php)
    else if (window.location.pathname.includes('/group_messages.php')) {
        new MessageFormHandler('/submit_group_message.php');
    }
});
