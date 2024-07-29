<?php
// Function to validate and sanitize form data
function validateFormData($data) {
    // Check if the data is set and not empty
    if (isset($data) && !empty($data)) {
        // Sanitize the data to prevent SQL injection
        return htmlspecialchars($data);
    } else {
        // Return false if the data is missing or empty
        return false;
    }
}

// Check if the request method is POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Validate form data
    $partyName = validateFormData($_POST['textbox']);
    $theme = validateFormData($_POST['themes']);
    $requestLimit = validateFormData($_POST['limit']);

    // Check if all form fields are filled
    if ($partyName && $theme && $requestLimit) {
        // Form data is valid, proceed with room creation

        // Include database connection parameters
        define('DB_SERVER', 'localhost');
        define('DB_USERNAME', 'id22259723_njamieson24');
        define('DB_PASSWORD', 'Noahlucas123!');
        define('DB_NAME', 'id22259723_djapp');

        // Establish a database connection
        $connection = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
        
        // Check if the connection was successful
        if ($connection) {
            // Generate a random 6-digit room code
            function generateRoomCode() {
                return str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
            }

            // Generate a new room
            function createRoom($connection, $partyName, $theme, $requestLimit) {
                // Generate a unique room code
                $roomCode = generateRoomCode();

                // Insert the room details into the database
                $query = "INSERT INTO rooms (room_code, party_name, theme, request_limit) 
                          VALUES ('$roomCode', '$partyName', '$theme', '$requestLimit')";
                $result = mysqli_query($connection, $query);

                // Check if the query was successful
                if ($result) {
                    return $roomCode; // Return the generated room code
                } else {
                    return false; // Return false if an error occurred
                }
            }

            // Create a new room
            $newRoomCode = createRoom($connection, $partyName, $theme, $requestLimit);

            // Check if the room was created successfully
            if ($newRoomCode) {
                // Redirect the user to dj_room.php with the room code in the URL
                header("Location: dj_room.php?room_code=$newRoomCode");
                exit(); // Stop further execution
            } else {
                // Return an error message if room creation failed
                echo json_encode(array("success" => false, "message" => "Failed to create room."));
            }

            // Close the database connection
            mysqli_close($connection);
        } else {
            // Return an error message if database connection fails
            echo json_encode(array("success" => false, "message" => "Failed to connect to the database."));
        }
    } else {
        // Form data is incomplete, show error message
        echo json_encode(array("success" => false, "message" => "Please fill out all required fields."));
    }
}
?>

<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>replit</title>
  <link href="main.css" rel="stylesheet" type="text/css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@600;900&display=swap" rel="stylesheet">
</head>

<body>
<header class="container">
    <div class="left-content">
      <h1 style="font-weight: 700;">collab<span style="color: #4590e6;">.</span></h1>
    </div>
  </header>
      <a href="index.php"><button type="button" class=back-arrow></button></a>
      
  <form id="createRoomForm" action="create_room.php" method="post">
    <div class="login text-center" style="margin: 0 auto; width: 80%;">
      <div class="row row-cols-1">
        <div class="col">
          <input class="room-pin cell" style="box-sizing: border-box;" type="text" id="enterbox" name="textbox" placeholder="PARTY NAME" maxlength="15" required />
        </div>
        <div class="col">
          <select name="themes" id="themes" class="btn-primary theme-dropdown cell" style="color: white;" required>
            <option disabled selected hidden>CHOOSE A THEME...</option>
            <option value="hiphop">HIPHOP</option>
            <option value="edm">EDM</option>
            <option value="house">HOUSE</option>
            <option value="country">COUNTRY</option>
            <option value="none">NONE</option>
          </select>
        </div>
        <div class="col">
          <select name="limit" id="limit" class="btn-primary limit-dropdown cell" style="color: white;" required>
            <option disabled selected hidden>REQUEST LIMIT...</option>
            <option value="1">1</option>
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="10">10</option>
           
          </select>
        </div>
        <div class="col">
          <button type="submit" name="createRoomBtn" id="create_room_button" style="padding: 2vh; border: 0.2px solid #657b9aff; background-color: rgba(50, 60, 74, 1);
border-radius: 15px; margin-top: 10px;">CREATE PARTY</button>
        </div>
      </div>
    </div>
  </form>
</body>

</html>
