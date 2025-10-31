<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="css/w3.css">
    <link rel="stylesheet" href="css/style.css">
    <title>Confirm Password Reset</title>
</head>
<body>
    <?php include "navigation.php"; ?>

    <div class="parentDiv">
        <form method="POST" action="/confirm_reset.php" class="w3-container">
            <label> Type in new password </label> <?php echo $errors['password'] ?? ''; ?><br>
            <input name="password" value="<?php echo $_POST['password'] ?? ''; ?>" min="5" placeholder="minimum 5 characters" class="w3-input" type="text" required> <br>
            <input type="hidden" name="username" value="<?php echo $username; ?>">
            <br>
            <br>
            <button class="w3-btn" type="submit"> CONFIRM </button>
            <br>
        </form>
    </div>
</body>
</html>
