<?php
class Database {
    protected $connect;

    // Constructor to initialize the database connection
    public function __construct($servername, $username, $password, $dbname) {
        // Create a new mysqli connection
        $this->connect = new mysqli($servername, $username, $password, $dbname);

        // Check if the connection was successful
        if ($this->connect->connect_error) {
            die("Database connection failed: " . $this->connect->connect_error);
        }
    }

    // Function to execute a query and return the result
    public function dbQuery($query) {
        $result = mysqli_query($this->connect, $query);

        if (!$result) {
            die("Query failed: " . mysqli_error($this->connect));
        }

        return $result;
    }

    // Function to escape input data (important for security)
    public function escapeString($string) {
        return mysqli_real_escape_string($this->connect, $string);
    }

    // Destructor to close the database connection
    public function __destruct() {
        $this->connect->close();
    }
}
?>
