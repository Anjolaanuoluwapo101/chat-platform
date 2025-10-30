<?php
//check if user is logged in
if (isset($_SESSION['user'])) {
    header('Location: messages.php?q=' . urlencode($_SESSION['user']['username']));
    exit;
}
?>
<!DOCTYPE html>
<html>

<head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="css/w3.css">
    <link rel="stylesheet" href="css/style.css">
    <title>Secret Ville Login</title>
</head>

<body>
    <?php

    $errors = $_SESSION['errors'] ?? [];
    $messages = $_SESSION['messages'] ?? [];
    unset($_SESSION['errors'], $_SESSION['messages']);
    include "navigation.php";
    ?>

    <div class="parentDiv">
        <?php if (isset($messages['info'])): ?>
            <div style="color:blue;text-align:center;margin-bottom:20px;"><?php echo htmlspecialchars($messages['info']); ?>
            </div>
        <?php endif; ?>
        <form method="POST" action="../public/login.php" class="w3-container">
            <label> USERNAME </label> <span
                style="color:red;"><?php echo htmlspecialchars($errors['username'] ?? ''); ?></span><br>
            <input name="username" value="<?php echo htmlspecialchars($_POST['username'] ?? ''); ?>"
                placeholder="minimum 5 characters" class="w3-input" type="text" required> <br>
            <br>
            <br>
            <label> PASSWORD </label> <span
                style="color:red;"><?php echo htmlspecialchars($errors['password'] ?? ''); ?></span><br>
            <input name="password" class="w3-input" type="password" required> <br>
            <br>
            <br>
            <button class="w3-btn" type="submit"> LOGIN </button>
            <br>
            <br>
            <br>
            <br>
            <a style="text-decoration:none;display:block;text-align:center;color:saddlebrown" href="reset.php"> Forgot
                Password?</a>
            <br>
            <span class="spanForm"> Don't have an account? <a style="color:saddlebrown" href="register.php"> Click
                    Here</a> </span>
        </form>
    </div>


    <?php include "footer.php"; ?>
</body>

</html>