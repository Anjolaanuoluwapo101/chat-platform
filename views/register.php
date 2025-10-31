<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="css/w3.css">
    <link rel="stylesheet" href="css/style.css">
    <title>Secret Ville Registration</title>
</head>
<body>
    <?php include "navigation.php"; ?>

    <div style="width:100%;text-align:center;margin-top:150px;font-weight:900;">
        SIMPLE ANONYMOUS MESSAGE WEBSITE
    </div>

    <div class="parentDiv">
        <form id="registerForm" class="w3-container">
            <label> USERNAME </label> <span id="usernameError" style="color:red;"></span><br>
            <input name="username" id="username" value="<?php echo $_POST['username'] ?? ''; ?>" placeholder="minimum 5 characters" class="w3-input" type="text" required> <br>
            <br>
            <br>
            <label> PASSWORD </label> <span id="passwordError" style="color:red;"></span><br>
            <input name="password" id="password" value="<?php echo $_POST['password'] ?? ''; ?>" class="w3-input" type="password" required> <br>
            <br>
            <br>
            <label> EMAIL </label> <span id="emailError" style="color:red;"></span><br>
            <input name="email" id="email" value="<?php echo $_POST['email'] ?? ''; ?>" placeholder="for recovery purpose" class="w3-input" type="email" required> <br>
            <br>
            <br>
            <button class="w3-btn" type="submit"> REGISTER </button>
            <br>
            <br>
            <br>
            <span class="spanForm"> Already have an account? <a style="color:saddlebrown" href="login.php"> Click Here</a> </span>
        </form>
    </div>

    <script>
        document.getElementById('registerForm').addEventListener('submit', function(e) {
            e.preventDefault();

            // Client-side validation
            let errors = {};
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            const email = document.getElementById('email').value.trim();

            if (username.length < 5) {
                errors.username = 'Username must be at least 5 characters.';
            }
            if (password.length < 5) {
                errors.password = 'Password must be at least 5 characters.';
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.email = 'Invalid email address.';
            }

            // Clear previous errors
            document.getElementById('usernameError').textContent = '';
            document.getElementById('passwordError').textContent = '';
            document.getElementById('emailError').textContent = '';

            // Display client-side errors
            if (Object.keys(errors).length > 0) {
                if (errors.username) document.getElementById('usernameError').textContent = errors.username;
                if (errors.password) document.getElementById('passwordError').textContent = errors.password;
                if (errors.email) document.getElementById('emailError').textContent = errors.email;
                return;
            }

            // Send AJAX request
            const formData = new FormData(this);
            fetch('register.php', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.success) {
                    alert(data.message);
                    window.location.href = data.redirect;
                } else {
                    // Display server errors
                    if (data.errors.username) document.getElementById('usernameError').textContent = data.errors.username;
                    if (data.errors.password) document.getElementById('passwordError').textContent = data.errors.password;
                    if (data.errors.email) document.getElementById('emailError').textContent = data.errors.email;
                    if (data.errors.general) alert(data.errors.general);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            });
        });
    </script>
    <?php include "footer.php"; ?>
</body>
</html>
