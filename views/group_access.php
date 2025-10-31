<!DOCTYPE html>
<html>

<head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="css/w3.css">
    <link rel="stylesheet" href="css/style.css">
    <title>Access Group - Secret Ville</title>
</head>

<body>
    <?php include "navigation.php"; ?>

    <div class="w3-container">
        <h2>Access Group: <?php echo htmlspecialchars($group['name']); ?></h2>

        <?php if (isset($error)): ?>
            <div class="w3-panel w3-red">
                <p><?php echo $error; ?></p>
            </div>
        <?php endif; ?>

        <form method="POST" action="/group_messages.php?id=<?php echo $group['id']; ?>" class="w3-card w3-padding">
            <div class="w3-margin-bottom">
                <label for="password">Enter Group Password:</label>
                <input type="password" id="password" name="password" class="w3-input" required>
            </div>

            <button type="submit" class="w3-button w3-blue">Access Group</button>
            <a href="/groups.php" class="w3-button w3-grey">Back to Groups</a>
        </form>
    </div>

    <?php include "footer.php"; ?>
</body>

</html>
