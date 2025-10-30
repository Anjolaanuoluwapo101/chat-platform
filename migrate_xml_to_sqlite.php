<?php

require 'vendor/autoload.php';

use App\Database\SQLiteDatabase;
use App\Config\Config;

$db = new SQLiteDatabase();

// Load XML data
$xml = simplexml_load_file('database/database.xml');

if ($xml) {
    foreach ($xml->users->user as $user) {
        $username = (string)$user['id1'];
        $password = (string)$user['id2'];
        $email = (string)$user['id3'];

        // Hash the password if not already hashed
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        $userData = [
            'username' => $username,
            'password_hash' => $passwordHash,
            'email' => $email ?: null
        ];

        if ($db->saveUser($userData)) {
            echo "Migrated user: $username\n";

            // Migrate messages
            foreach ($user->message as $message) {
                $content = (string)$message->text;
                $time = (string)$message->time;

                $messageData = [
                    'username' => $username,
                    'content' => $content
                ];

                if ($db->saveMessage($messageData)) {
                    echo "  Migrated message\n";
                } else {
                    echo "  Failed to migrate message\n";
                }
            }
        } else {
            echo "Failed to migrate user: $username\n";
        }
    }
} else {
    echo "Failed to load XML file\n";
}

echo "Migration completed\n";
