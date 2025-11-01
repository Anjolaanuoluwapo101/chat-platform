<!DOCTYPE html>
<html>

<head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="css/w3.css">
    <link rel="stylesheet" href="css/style.css">
    <title>Secret Ville Groups</title>
</head>

<body>
    <?php include "navigation.php"; ?>

    <div class="w3-container">
        <h2>Groups</h2>
        <a href="/create_group.php" class="w3-button w3-blue">Create New Group</a>
        <br><br>

        <?php if (!empty($groups)): ?>
            <div class="w3-row">
                <?php foreach ($groups as $group): ?>
                    <div class="w3-col m4 l3">
                        <div class="w3-card w3-margin">
                            <div class="w3-container">
                                <h4><?php echo htmlspecialchars($group['name']); ?></h4>
                                <p>Created: <?php echo $group['created_at']; ?></p>
                                <p><?php echo $group['password_hash'] ? 'Password Protected' : 'Public'; ?></p>
                                <a href="/group_messages.php?id=<?php echo $group['id']; ?>" class="w3-button w3-green">View Messages</a>
                                <?php if (isset($_SESSION['user']) && $_SESSION['user']['id'] == $group['creator_id']): ?>
                                    <form method="POST" action="/delete_group.php" style="display:inline;">
                                        <input type="hidden" name="group_id" value="<?php echo $group['id']; ?>">
                                        <button type="submit" class="w3-button w3-red" onclick="return confirm('Are you sure?')">Delete</button>
                                    </form>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php else: ?>
            <p>No groups available. <a href="/create_group.php">Create one</a>!</p>
        <?php endif; ?>
    </div>

    <?php include "footer.php"; ?>
</body>

</html>
