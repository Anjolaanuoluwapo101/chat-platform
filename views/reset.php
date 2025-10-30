<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="css/w3.css">
    <link rel="stylesheet" href="css/style.css">
    <title>Password Reset</title>
</head>
<body>
    <?php include "navigation.php"; ?>

    <div class="parentDiv">
        <form method="POST" action="" class="w3-container">
            <label> USERNAME </label> <?php echo $errors['username'] ?? ''; ?><br>
            <input name="username" value="<?php echo $_POST['username'] ?? ''; ?>" min="5" placeholder="minimum 5 characters" class="w3-input" type="text" required> <br>
            <br>
            <br>
            <button class="w3-btn" type="submit"> SEND RESET EMAIL </button>
            <br>
        </form>
    </div>
</body>
</html>
