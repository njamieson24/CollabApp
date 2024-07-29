<?php
// Database connection details
$servername = 'localhost'; // or your database server address
$username = 'id22259723_njamieson24'; // the database username
$password = 'Noahlucas123!'; // the database password
$dbname = 'id22259723_djapp'; // the name of the database you want to use

        

// Create a database connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check if the connection is successful
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the JSON input from the POST request
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if ($data) {
    // Extract the track information
    $song_name = $data['song_name'];
    $artist_name = $data['artist_name'];
    $album_image = $data['album_image'];
    $room_code = $data['room_code'];

    // Prepare an SQL statement to insert the data into the database
    $stmt = $conn->prepare("INSERT INTO song_queue (song_name, artist_name, album_image, room_code) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $song_name, $artist_name, $album_image, $room_code);

    // Execute the statement
    if ($stmt->execute()) {
        echo "Data inserted successfully.";
    } else {
        echo "Error inserting data: " . $stmt->error;
    }

    // Close the statement
    $stmt->close();
} else {
    echo "No data received.";
}

// Close the database connection
$conn->close();
?>
