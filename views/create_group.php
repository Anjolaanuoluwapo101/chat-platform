<!DOCTYPE html>
<html>

<head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="css/w3.css">
    <link rel="stylesheet" href="css/style.css">
    <title>Create Group - Secret Ville</title>
</head>

<body>
    <?php include "navigation.php"; ?>

    <div class="w3-container">
        <h2>Create New Group</h2>

        <?php if (isset($error)): ?>
            <div class="w3-panel w3-red">
                <p><?php echo $error; ?></p>
            </div>
        <?php endif; ?>

        <form method="POST" action="/create_group.php"
            class="w3-card w3-padding">
            <div class="w3-margin-bottom">
                <label for="name">Group Name:</label>
                <input type="text" id="name" name="name" class="w3-input" required>
            </div>

            <div class="w3-margin-bottom">
                <label for="password">Password (optional):</label>
                <input type="password" id="password" name="password" class="w3-input" placeholder="Leave empty for public group">
            </div>

            <button type="submit" class="w3-button w3-blue">Create Group</button>
            <a href="/groups.php" class="w3-button w3-grey">Cancel</a>
        </form>
    </div>

    <?php include "footer.php"; ?>
</body>

</html>
