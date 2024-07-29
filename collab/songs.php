<?php
// Include database connection parameters
  define('DB_SERVER', 'localhost');
        define('DB_USERNAME', 'id22259723_njamieson24');
        define('DB_PASSWORD', 'Noahlucas123!');
        define('DB_NAME', 'id22259723_djapp');

// Establish a database connection
$connection = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check if the connection was successful
if ($connection) {
  if (isset($_GET['room_code'])) {
    // Retrieve the room code from the URL
    $roomCode = $_GET['room_code'];

    // Query to retrieve songs based on the provided room code
    $songQuery = "SELECT * FROM song_queue WHERE room_code = '$roomCode'";
    $songResult = mysqli_query($connection, $songQuery);

    // Check if the query returned any rows
    if ($songResult && mysqli_num_rows($songResult) > 0) {
      $songs = [];
      while ($songRow = mysqli_fetch_assoc($songResult)) {
        $songs[] = $songRow;
      }
      echo json_encode($songs);
    } else {
      echo json_encode([]);
    }
  } else {
    echo json_encode([]);
  }

  // Close the database connection
  mysqli_close($connection);
} else {
  // Failed to connect to the database
  echo json_encode([]);
}
?>
