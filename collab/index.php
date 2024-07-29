<?php
// Function to validate room code
function isValidRoomCode($roomCode, $connection) {
    // Prepare and execute the query to check if the room code exists in the database
    $query = "SELECT * FROM rooms WHERE room_code = '$roomCode'";
    $result = mysqli_query($connection, $query);

    // Check if the query returned any rows
    if ($result && mysqli_num_rows($result) > 0) {
        return true; // Room code is valid
    } else {
        return false; // Room code is invalid
    }
}

// Check if a room code was provided
if (isset($_POST['room_code'])) {
    // Validate the provided room code
    $roomCode = $_POST['room_code'];

    // Include database connection parameters
   define('DB_SERVER', 'localhost');
        define('DB_USERNAME', 'id22259723_njamieson24');
        define('DB_PASSWORD', 'Noahlucas123!');
        define('DB_NAME', 'id22259723_djapp');

    // Establish a database connection
    $connection = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

    if ($connection) {
        // Validate the room code
        if (isValidRoomCode($roomCode, $connection)) {
            // Room code is valid, redirect user to party_room.php with the room code
            header("Location: party_room.php?room_code=$roomCode");
            exit();
        } else {
            // Room code is invalid, set error message
            $errorMessage = "Invalid room code. Please try again.";
        }

        // Close the database connection
        mysqli_close($connection);
    } else {
        // Database connection failed, set error message
        $errorMessage = "Failed to connect to the database.";
    }
}
?>

<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>DJ App</title>
  <link href="style.css" rel="stylesheet" type="text/css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <meta name="theme-color" content="#343a53">
</head>

<body>

<div class="login text-center vertical-center" style="margin: auto; width: 70%;">
    <div class="row row-cols-1">
      <div class="col">
        <h1 class="barlow-semibold" style="color: white; text-align:center;">collab<span style="color: #4590e6;">.</span></h1>
      </div>
      <div class="col">
        <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>">
          <input class="room-pin cell" style="box-sizing: border-box;" type="text" id="enterbox" name="room_code" inputmode="numeric" placeholder="ROOM PIN"
            maxlength="6" />
          <button class="enter-button cell" type="submit">ENTER</button>
          <?php if(isset($errorMessage)) echo "<p style='color: red;'>$errorMessage</p>"; ?>
        </form>
      </div>
      <div class="col">
        <h2 class="barlow-semibold" style="color: white; text-align: center; padding: 10px;"> - OR - </h2>
      </div>
      <div class="col">
        <a style="text-decoration:none;" href="create_room.php"><button class="create-button cell" type="button">CREATE
            ROOM</button></a>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
    crossorigin="anonymous"></script>

  <script src="page-content.js"></script>

</body>

</html>
