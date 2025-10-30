<?php

?>

<!DOCTYPE html>
<html>

<head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="css/w3.css">
    <link rel="stylesheet" href="css/style.css">
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
            </div>
            <br>
            <br>
            <br>


            <?php foreach ($messages as $msg): ?>
                <div class="messageDiv">
                    <div class="textDiv">
                        <?php echo $msg['content']; ?>
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
            <form id="messageForm" method="POST" action="../public/submit_message.php" class="w3-container">
                <input type="hidden" name="username" value="<?php echo $username; ?>">
                <input name="message" id="messageText" class="w3-input" type="text"
                    style="height:500px;width:100%;border-radius:20px;padding:20px;">
                <input type="hidden" name="timeSent" value="<?php echo date('Y-m-d H:i:s'); ?>">
                <br>
                <br>
                <button style="width:200px" type="submit"> SEND YOUR MESSAGE </button>
            </form>
            <div id="successMessage" style="display:none; color: green;">Message sent successfully!</div>

            <script>
                document.getElementById('messageForm').addEventListener('submit', function(e) {
                    e.preventDefault();

                    var form = e.target;
                    var formData = new FormData(form);

                    fetch(form.action, {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            document.getElementById('successMessage').style.display = 'block';
                            document.getElementById('messageText').value = '';
                            setTimeout(function() {
                                document.getElementById('successMessage').style.display = 'none';
                            }, 3000);
                        } else {
                            alert('Error: ' + data.message);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('An error occurred while sending the message.');
                    });
                });
            </script>
        <?php endif; ?>
    </div>

    <?php include "footer.php"; ?>
</body>

</html>