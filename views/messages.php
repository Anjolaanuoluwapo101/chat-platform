<?php

?>

<!DOCTYPE html>
<html>

<head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="css/w3.css">
    <link rel="stylesheet" href="css/style.css">

    <?php if ($isOwner): ?>
        <script src="https://js.pusher.com/8.4.0/pusher.min.js"></script>
    <?php endif; ?>

    <title>Secret Ville Messages</title>
</head>

<body>
    <?php
    include "navigation.php";
    ?>

    <div class="parentDiv">
        <?php if ($isOwner): ?>
            <div class="textDiv" style="display:block!important;text-align:center;">
                <h4>COPY THE LINK BELOW</h4>
                Hey guys, say something about me in secret at Secret Ville <br>
                Here is my link;
                <script>document.write(window.location.href);</script>
                <br>
                <br>
                <br>
            </div>
            <br>
            <br>
            <br>


            <?php foreach ($messages as $msg): ?>
                <div class="messageDiv">
                    <div class="textDiv">
                        <?php echo $msg['content']; ?>
                        <?php if (!empty($msg['photos'])): ?>
                            <?php foreach ($msg['photos'] as $photo): ?>
                                <img src="<?php echo $photo['file_path']; ?>" alt="Photo" style="max-width: 200px;">
                            <?php endforeach; ?>
                        <?php endif; ?>
                        <?php if (!empty($msg['videos'])): ?>
                            <?php foreach ($msg['videos'] as $video): ?>
                                <video src="<?php echo $video['file_path']; ?>" alt="Video" style="max-width: 200px;"></video>
                            <?php endforeach; ?>
                        <?php endif; ?>
                        <?php if (!empty($msg['audios'])): ?>
                            <?php foreach ($msg['audios'] as $audio): ?>
                                <audio controls src="<?php echo $audio['file_path']; ?>" alt="Audio"></audio>
                            <?php endforeach; ?>
                        <?php endif; ?>

                    </div>
                    <div class="timeDiv">
                        Sent on <?php echo $msg['created_at']; ?>
                    </div>
                </div>
                <br>
                <br>
                <br>
            <?php endforeach; ?>

        <?php endif; ?>

        <?php if (!$isOwner): ?>
            <form id="messageForm" method="POST" action="/submit_message.php" class="w3-container"
                enctype="multipart/form-data">
                <input type="hidden" name="username" value="<?php echo $username; ?>">
                <input name="message" id="messageText" class="w3-input" type="text"
                    style="height:500px;width:100%;border-radius:20px;padding:20px;">
                <input type="file" name="media[]" multiple accept="image/*, video/*, audio/*">
                <input type="hidden" name="timeSent" value="<?php echo date('Y-m-d H:i:s'); ?>">
                <br>
                <br>
                <button style="width:200px" type="submit"> SEND YOUR MESSAGE </button>
            </form>
            <div id="successMessage" style="display:none; color: green;">Message sent successfully!</div>
            <script src="js/messages.js"> </script>
        <?php endif; ?>

        <?php if ($isOwner): ?>
            <script src="js/pusher.js"> </script>
            <script>
                // Initialize Pusher for individual messages
                const messagePusher = new MessagePusher('7e136cd2a9797c421ac1', 'eu', '/authenticate-pusher');
                messagePusher.setChannel('individual', '<?php echo $username; ?>');
                messagePusher.subscribeToChannel();
            </script>
        <?php endif; ?>
    </div>

    <!-- <?php include "footer.php"; ?> -->
</body>

</html>