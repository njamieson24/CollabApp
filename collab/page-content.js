const loginContent = ` <div class="vertical-center" style="text-align: center; width: 250px; padding: 10px;">
<form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>">
<input class="room-pin cell" style=" box-sizing: border-box;" type="text" id="enterbox" name="room_code" inputmode="numeric" placeholder="ROOM PIN" maxlength="6" />
<div class="col">
<a href="#"><button class="enter-button cell" type="submit">ENTER</button></a>
</form>
</div>
<h2 class="barlow-semibold" style="color: white; margin-top: 10px;">- OR - </h2>
<a style="text-decoration:none;" href="#"><button id="create-room" class="create-button cell" type="button" onclick="generateCreate()">CREATE ROOM</button></a></div>`;

const createContent = `<div class="vertical-center" style="text-align: center; width: 250px; padding: 10px;"><input class="room-pin cell" style=" box-sizing: border-box;" type="text" id="enterbox" name="textbox"inputmode="numeric" placeholder="Party Name" maxlength="6"/><select name="themes" id="themes" class="theme-dropdown cell">
            <option disabled selected hidden>CHOOSE A THEME...</option>
            <option value="hiphop">HIPHOP</option>
            <option value="edm">EDM</option>
            <option value="house">HOUSE</option>
            <option value="country">COUNTRY</option>
            <option value="none">NONE</option>
          </select>
          <select name="placeholder2" id="placeholder2" class="limit-dropdown cell">
            <option disabled selected hidden>REQUEST LIMIT...</option>
            <option value="placeholder">1</option>
            <option value="placeholder">3</option>
            <option value="placeholder">5</option>
            <option value="placeholder">10</option>
            <option value="placeholder">UNLIMITED</option>
          </select>
          <a href="#"><button id="create-party" class="create-button cell" type="button">Create Party</button></a>

          </div>`;


function generateLogin() {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = loginContent;
}

generateLogin();

function generateCreate() {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = createContent;
}


