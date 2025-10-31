<!DOCTYPE html>
<html>

<head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="css/w3.css">
    <link rel="stylesheet" href="css/style.css">
    <script src="https://js.pusher.com/8.4.0/pusher.min.js"></script>
    <title><?php echo htmlspecialchars($group['name']); ?> - Secret Ville</title>
</head>

<body>
    <?php include "navigation.php"; ?>

    <div class="w3-container">
        <h2><?php echo htmlspecialchars($group['name']); ?> Messages</h2>
        <a href="/groups" class="w3-button w3-grey">Back to Groups</a>
        <br><br>
    </div>

    <div class="parentDiv">
        <div class="textDiv" style="display:block!important;text-align:center;">
            <h4>Welcome to <?php echo htmlspecialchars($group['name']); ?>!</h4>
            Share messages anonymously with the group.<br><br>
        </div>

        <?php foreach ($messages as $msg): ?>
            <div class="messageDiv">
                <div class="textDiv">
                    <strong><?php echo htmlspecialchars($msg['username']); ?>:</strong> <?php echo $msg['content']; ?>
                    <?php if (!empty($msg['photos'])): ?>
                        <?php foreach ($msg['photos'] as $photo): ?>
                            <img src="<?php echo $photo['file_path']; ?>" alt="Photo" style="max-width: 200px;">
                        <?php endforeach; ?>
                    <?php endif; ?>
                    <?php if (!empty($msg['videos'])): ?>
                        <?php foreach ($msg['videos'] as $video): ?>
                            <video src="<?php echo $video['file_path']; ?>" controls style="max-width: 200px;"></video>
                        <?php endforeach; ?>
                    <?php endif; ?>
                    <?php if (!empty($msg['audios'])): ?>
                        <?php foreach ($msg['audios'] as $audio): ?>
                            <audio controls src="<?php echo $audio['file_path']; ?>"></audio>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
                <div class="timeDiv">
                    Sent on <?php echo $msg['created_at']; ?>
                </div>
            </div>
            <br>
        <?php endforeach; ?>

        <form id="messageForm" method="POST" action="/submit_group_message.php" class="w3-container"
            enctype="multipart/form-data">
            <input type="hidden" name="group_id" value="<?php echo $group['id']; ?>">
            <textarea name="message" id="messageText" class="w3-input" placeholder="Type your message..."
                style="height:150px;width:100%;border-radius:20px;padding:20px;" required></textarea>
            <input type="file" name="media[]" multiple accept="image/*, video/*, audio/*">
            <br><br>
            <button style="width:200px" type="submit">SEND MESSAGE</button>
        </form>
        <div id="successMessage" style="display:none; color: green;">Message sent successfully!</div>

        <script src="js/messages.js"></script>
        <script src="js/pusher.js"></script>
        <script>
            // Initialize Pusher for group messages
            const messagePusher = new MessagePusher('7e136cd2a9797c421ac1', 'eu', '/authenticate-pusher.php');
            messagePusher.setChannel('group', <?php echo $group['id']; ?>);
            messagePusher.subscribeToChannel();
        </script>
    </div>

    <?php include "footer.php"; ?>
</body>

</html>