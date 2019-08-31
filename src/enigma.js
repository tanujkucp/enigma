/**
* Enigma Settings
* Stores global variables and machine settings
*/
function ENIGMA() {
    // Debug the wiring.
    this.debug_wiring = 0; // 0 = off, 1 = on
    this.debug_string = "Kb  Pb  R   M   L   Rf  L   M   R   Pb\n"; // Init debug content string

    // Plaintext Alphabet
    this.plaintext = ".ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    // Rotor Wiring
    this.arrRotors = new Array();
    this.arrRotors[1] = ".EKMFLGDQVZNTOWYHXUSPAIBRCJ";   // Rotor I
    this.arrRotors[2] = ".AJDKSIRUXBLHWTMCQGZNPYFVOE";   // Rotor II
    this.arrRotors[3] = ".BDFHJLCPRTXVZNYEIWGAKMUSQO";   // Rotor III
    this.arrRotors[4] = ".ESOVPZJAYQUIRHXLNFTGKDCMWB";   // Rotor IV
    this.arrRotors[5] = ".VZBRGITYUPSDNHLXAWMJQOFECK";   // Rotor V
    this.arrRotors[6] = ".JPGVOUMFYQBENHZRDKASXLICTW";   // Rotor VI
    this.arrRotors[7] = ".NZJHGRCXMYSWBOUFAIVLPEKQDT";   // Rotor VII
    this.arrRotors[8] = ".FKQHTLXOCBJSPDZRAMEWNIUYGV";   // Rotor VIII
    this.arrRotors["b"] = ".LEYJVCNIXWPBQMDRTAKZGFUHOS"; // M4 Greek Rotor "b" (beta)
    this.arrRotors["g"] = ".FSOKANUERHMBTIYCWLQPZXVGJD"; // M4 Greek Rotor "g" (gama)

    this.arrKnockpoints = new Array();
    this.arrKnockpoints[1] = new Array(17, 17); //   Q - one knockpoint (R I)
    this.arrKnockpoints[2] = new Array(5, 5);   //   E - one knockpoint (R II)
    this.arrKnockpoints[3] = new Array(22, 22); //   V - one knockpoint (R III)
    this.arrKnockpoints[4] = new Array(10, 10); //   J - one knockpoint (R IV)
    this.arrKnockpoints[5] = new Array(26, 26); //   Z - one knockpoint (R V)
    this.arrKnockpoints[6] = new Array(26, 13); // Z/M - two knockpoints (R VI)
    this.arrKnockpoints[7] = new Array(26, 13); // Z/M - two knockpoints (R VII)
    this.arrKnockpoints[8] = new Array(26, 13); // Z/M - two knockpoints (R VIII)

    // Reflectors "B" and "C" (inc M4 thin reflectors) Wiring
    this.arrReflector = new Array();
    this.arrReflector["b"] = ".YRUHQSLDPXNGOKMIEBFZCWVJAT";      // M3 B
    this.arrReflector["c"] = ".FVPJIAOYEDRZXWGCTKUQSBNMHL";      // M3 C
    this.arrReflector["b_thin"] = ".ENKQAUYWJICOPBLMDXZVFTHRGS"; // M4 thin B
    this.arrReflector["c_thin"] = ".RDOBJNTKVEHMLFCWZAXGYIPSUQ"; // M4 thin C

    this.usedletters = ""; // Used letters in the steckerbrett
    this.lastkeypressed = ""; // Keyboard key pressed
    this.counter = 0; // Number of letters entered for grouping

    this.inputmethod = "single"; // input method: 'single' letter or 'block' of text
}

/**
 * Validate Input
 * Check input string is a letter A-Z and ensure it is uppercase
 *
 * @param {String} id - Element ID of input to validate
 */
function validate(id) {
    var string = document.getElementById(id).value;

    if (string.search(/[A-Z]/gi)) {
        // If the input is not a letter clear field, focus on it and stop processing.
        document.getElementById(id).value = "";
        document.getElementById(id).focus();
        return false;
    }

    // Otherwise make it a capital letter.
    document.getElementById(id).value = string.toUpperCase();
    return true;
}

/**
 * To Uppercase
 * Make element input value uppercase (shortcut function)
 *
 * @param {String} id - element ID
 */
function toUC(id) {
    return document.getElementById(id).value.toUpperCase();
}

/**
 * Swap Plugs
 * Swap the steckerbrett (plugboard) pairings
 * Eg, pair 'AD' - if 'A' goes in, 'D' comes out and vice versa
 *
 * @param {String} n - current letter to find pair for
 */
function swapPlugs(n) {
    var plug_i = toUC('plug'+n);
    var plug_o = "";

    if (plug_i == "") {
        // If the input letter is blank (ie, self-steckered), output the letter unchanged.
        plug_o = n;
    } else {
        // Otherwise do the swapsies!
        plug_o = ENIGMA.plaintext.indexOf(plug_i);
    }

    return plug_o;
}

/**
 * Fill Plugboard
 * Validate and autofill the steckerbrett (plugboard)
 *
 * @param {String} n - letter to be paired on plugboard
 */
function plugboard(n) {
    var plugnum, re, otherletter;
    var arrusedletters = new Array();

    validate('plug'+n); // make sure letter is A-Z

    var plug = toUC('plug'+n);

    if (plug != "") {
        // Check latter hasn't been used
        if (ENIGMA.usedletters.indexOf(plug) < 0) {
            // Get the numerical value for the letter
            plugnum = ENIGMA.plaintext.indexOf(plug);

            // Fill out the paired letter field.
            //  Eg, if field 'A' is 'D', fill out field 'D' as 'A'
            document.getElementById('plug'+plugnum).value = ENIGMA.plaintext.charAt(n);

            ENIGMA.usedletters += plug + ENIGMA.plaintext.charAt(n) + " ";
        } else {
            // If the input letter has already been used, ignore it and stop running the script.
            alert("You have already used the letter '"+plug+"' in a connection.\n"
                + "Delete its current connection to form a new one.");
            document.getElementById('plug'+n).value = "";
            document.getElementById('plug'+n).focus();
            return false;
        }
    } else {
        if (ENIGMA.lastkeypressed == 8 || ENIGMA.lastkeypressed == 46) {
            // Clear plugs on delete
            re = new RegExp("([A-Z]?)(" + ENIGMA.plaintext.charAt(n) + ")([A-Z]?)\\s", "g");
            arrusedletters = re.exec(ENIGMA.usedletters);
            otherletter = arrusedletters[1] + arrusedletters[3];

            plugnum = ENIGMA.plaintext.indexOf(otherletter);
            document.getElementById('plug'+plugnum).value = "";

            re = new RegExp("([A-Z]?)" + ENIGMA.plaintext.charAt(n) + "([A-Z]?)\\s", "g");
            ENIGMA.usedletters = ENIGMA.usedletters.replace(re, "");
        }
    }

    return true;
}

/* -----------------------------------------------------------------
    Enigma Process
     1. Convert input letter to number - validate!
     2. Rotate wheels
     3. Pass through plugboard
     4. Pass through right-hand wheel
     5. Pass through middle wheel
     6. Pass through left-hand wheel
     7. Pass through reflector
     8. Pass through left-hand wheel
     9. Pass through middle wheel
    10. Pass through right-hand wheel
    11. Pass through plugboard
    12. Convert to output letter
   ----------------------------------------------------------------- */

/**
 * Validate Letter
 * Letter numbers must be betwen 1 and 26
 * Simulates the wheels/rotors on the real Enigma
 *
 * @param {Integer} n - numerical representation of current letter
 */
function validLetter(n) {
    if (n <= 0) {
        // If negative number, add it to 26 to count back from "Z" (eg, 26 + -5 = 21)
        // Emulates wheel rotating backwards
        return (26 + n);
    } else if (n > 26) {
        // If number greater than 26, subtract 26 to count forward from "A" (eg, 30 - 26 = 4)
        // Emulates wheel rotating forwards
        return (n - 26);
    } else {
        // Or do nothing!
        return n;
    }
}

/**
 * Rotate Cogs
 * As text is entered, rotate the wheels (aka cogs) by one letter.
 * This occurs BEFORE the entered text is mapped.
 *
 * @param {Integer} r - right cog number identifyer
 * @param {Integer} m - middle cog number indentifyer
 */
function rotateCogs(r, m) {
    var pr = ENIGMA.plaintext.indexOf(toUC('rightw_set'));
    var pm = ENIGMA.plaintext.indexOf(toUC('middlew_set'));
    var pl = ENIGMA.plaintext.indexOf(toUC('leftw_set'));

    if (pr == parseFloat(ENIGMA.arrKnockpoints[r][0]) || pr == parseFloat(ENIGMA.arrKnockpoints[r][1])) {
        // If the knockpoint on the right wheel is reached rotate middle wheel
        // But first check if it too is a knock point
        if (pm == parseFloat(ENIGMA.arrKnockpoints[m][0]) || pm == parseFloat(ENIGMA.arrKnockpoints[m][1])) {
            // If the knockpoint on the middle wheel is reached rotate left wheel
            pl++;
        }
        pm++;
    } else {
        if (pm == parseFloat(ENIGMA.arrKnockpoints[m][0]) || pm == parseFloat(ENIGMA.arrKnockpoints[m][1])) {
            // If the knockpoint on the middle wheel is reached rotate left AND middle wheels
            // (the double stepping mechanism)
            pl++;
            pm++;
        }
    }

    // Rotate right wheel (this wheel is always rotated).
    pr++;

    // If rotating brings us beyond "Z" (26), then start at "A" (1) again.
    if (pr > 26) {pr = 1;}
    if (pm > 26) {pm = 1;}
    if (pl > 26) {pl = 1;}

    // Display new values in browser
    document.getElementById('rightw_set').value = ENIGMA.plaintext.charAt(pr);
    document.getElementById('middlew_set').value = ENIGMA.plaintext.charAt(pm);
    document.getElementById('leftw_set').value = ENIGMA.plaintext.charAt(pl);

    // Make values available to the rest of the script as an array.
    return new Array(pr, pm, pl);
}

/**
 * Map Letter
 * Map one letter to another through current wheel
 *
 * @param {Integer} number - input letter number
 * @param {Integer} ringstellung - wheel ring setting (static)
 * @param {Integer} wheelposition - wheel position (rotates)
 * @param {Integer} wheel - current wheel
 * @param {Integer} pass - are we going R->L (1) or L->R (2)
 */
function mapLetter(number, ringstellung, wheelposition, wheel, pass) {
    // Change number according to ringstellung (ring setting)
    // Wheel turns anti-clockwise (looking from right)
    number = number - ringstellung;

    // Check number is between 1 and 26
    number = validLetter(number);

    // Change number according to wheel position
    // Wheel turns clockwise (looking from right)
    number = number + wheelposition;

    // Check number is between 1 and 26
    number = validLetter(number);

    // Do internal connection 'x' to 'y' according to direction
    if (pass == 2) {
        // L->R
        var let = ENIGMA.plaintext.charAt(number);
        number = ENIGMA.arrRotors[wheel].indexOf(let);
    } else {
        // R->L
        var let = ENIGMA.arrRotors[wheel].charAt(number);
        number = ENIGMA.plaintext.indexOf(let);
    }

    /*
     * NOW WORK IT BACKWARDS : subtract where we added and vice versa
     */

    // Change according to wheel position (anti-clockwise)
    number = number - wheelposition;

    // Check number is between 1 and 26
    number = validLetter(number);

    // Change according to ringstellung (clockwise)
    number = number + ringstellung;

    // Check number is between 1 and 26
    number = validLetter(number);

    return number;
}

/**
 * Light up the output letter
 * Unnecessary (but cute) imitation of the real Enigma machines
 *
 * @param {String} n - the letter light up
 */
function lightUp(n) {
    for (var i = 1; i <= 26; i++) {
        // Wipe all previous lights - make font colour grey
        document.getElementById('l_'+ENIGMA.plaintext.charAt(i)).setAttribute('class', 'led_off');
    }

    // Light up the outout letter - make font colour yellow
    document.getElementById('l_'+n).setAttribute('class', 'led_on');
}

/**
 * DEBUG
 * Debug the wiring - capture current state of text at change points
 * Only displayed to screen if debug_wiring is on.
 * @param {Integer} m - mode (last pass)
 * @param {Integer} n - number of letter
 */
function run_debug(m, n) {
    if (m == 1) {
        ENIGMA.debug_string += ENIGMA.plaintext.charAt(n);
        if (ENIGMA.debug_wiring == 1) {
            document.getElementById('showDebug').value += ENIGMA.debug_string + "\n";
        }
        ENIGMA.debug_string = "";
    } else {
        ENIGMA.debug_string += ENIGMA.plaintext.charAt(n) + " > ";
    }
}

/**
 * Do the Cipher
 * Run the whole Enigma machine process.
 * The functions above are called from this routine.
 */
function doCipher() {
    // Type of Enigma to Use: M3/M4
    var enigma_type = document.getElementById('enigma_type').value;

    // Get current status of Wheel Order (Walzenlage)
    var wheel_r = parseFloat(document.getElementById('rightw_no').value);
    var wheel_m = parseFloat(document.getElementById('middlew_no').value);
    var wheel_l = parseFloat(document.getElementById('leftw_no').value);
    var wheel_g = document.getElementById('greek_no').value; // M4 Greek Wheek

    // Get current status of Wheel Ring Setting (Ringstellung)
    var ring_r = ENIGMA.plaintext.indexOf(toUC('rightw_ring'));
    var ring_m = ENIGMA.plaintext.indexOf(toUC('middlew_ring'));
    var ring_l = ENIGMA.plaintext.indexOf(toUC('leftw_ring'));
    var ring_g = ENIGMA.plaintext.indexOf(toUC('greek_ring'));

    // Get Reflector Wheel (Umkehrwalze) depending on Enigma machine type
    if (enigma_type == "m4") {
        // B thin (default) or C tbin
        var useReflector = document.getElementById('use_reflector_thin').value;
    } else {
        // B (default) or C
        var useReflector = document.getElementById('use_reflector').value;
    }

    // Grouping of letters in blocks
    var grouping = document.getElementById('letter_grouping').value;

    // Are the selected rotors all different?
    if (wheel_r == wheel_m || wheel_r == wheel_l || wheel_m == wheel_l ) {
        alert("Wheel Numbers must be unique. Eg, I II III not II II II");
        document.getElementById('rightw_no').focus();
        return false;
    }

    // Get input letter
    var letterinput = toUC('textin');

    if (letterinput.search(/[A-Z]/gi)) {
        // If input is not a letter [A-Z], then return false and do nothing
        // except clear and focus the letter input field
        document.getElementById('textin').value = "";
        document.getElementById('textin').focus();
        return false;
    }

    // Rotate Wheels (wheel_r and wheel_m have knock points, so we pass them to funtion)
    var wheel_position = rotateCogs(wheel_r, wheel_m);

    // Wheel Starting Position
    var start_r = wheel_position[0];
    var start_m = wheel_position[1];
    var start_l = wheel_position[2];
    var start_g = ENIGMA.plaintext.indexOf(toUC('greek_set')); // M4 does not rotate

    // Input
    var input = ENIGMA.plaintext.indexOf(letterinput);

    run_debug(0, input);

    // First Pass - Plugboard
    var number = swapPlugs(input);

    run_debug(0, number);

    // Passes through ETW which acts as a static converter from plugboard wires to wheels
    // So:  Plugboard --> ETW --> Right Wheel
    // A -->  A  --> A

    // First Pass - R Wheel
    number = mapLetter(number,ring_r,start_r,wheel_r, 1);

    run_debug(0, number);

    // First Pass - M Wheel
    number = mapLetter(number,ring_m,start_m,wheel_m, 1);

    run_debug(0, number);

    // First Pass - L Wheel
    number = mapLetter(number,ring_l,start_l,wheel_l, 1);

    run_debug(0, number);

    // If using M4 Enigma
    if (enigma_type == "m4") {
        // First Pass - Greek Wheel
        number = mapLetter(number,ring_g,start_g,wheel_g, 1);
    }

    // Reflector
    var let = ENIGMA.arrReflector[useReflector].charAt(number);
    number = ENIGMA.plaintext.indexOf(let);

    run_debug(0, number);

    // If using M4 Enigma
    if (enigma_type == "m4") {
        // Second Pass - Greek Wheel
        number = mapLetter(number,ring_g,start_g,wheel_g, 2);
    }

    // Second Pass - L Wheel
    number = mapLetter(number,ring_l,start_l,wheel_l, 2);

    run_debug(0, number);

    // Second Pass - M Wheel
    number = mapLetter(number,ring_m,start_m,wheel_m, 2);

    run_debug(0, number);

    // Second Pass - R Wheel
    number = mapLetter(number,ring_r,start_r,wheel_r, 2);

    run_debug(0, number);

    // Passes through ETW again

    // Second Pass - Plugboard
    number = swapPlugs(number);

    run_debug(1, number);

    // Convert value to corresponding letter
    var output = ENIGMA.plaintext.charAt(number);

    // Clean number
    number = "";

    // Build Message Strings for Input and Output

    // Get current string values
    var msg_in = document.getElementById('msg_in').value;
    var msg_out = document.getElementById('msg_out').value;

    if (ENIGMA.counter == grouping) {
        // Space out message in/out as letter blocks of X length (grouping)
        msg_in = msg_in + " ";
        msg_out = msg_out + " ";
        ENIGMA.counter = 0;
    }

    // Increment counter
    ENIGMA.counter++;

    // Spit out new string values
    document.getElementById('msg_in').value = msg_in + letterinput;
    document.getElementById('msg_out').value = msg_out + output;

    // Show output letter in lightbox.
    lightUp(output);

    // Clear and focus letter input field
    document.getElementById('textin').value = "";
    document.getElementById('textin').focus();

    return true;
}


/* -----------------------------------------------------------------
    Code for saving & loading machine settings.
    Not part of main enigma emulation
   ----------------------------------------------------------------- */

/**
 * Load Preset
 * Load a saved user preset from a bookmark
 *
 * @param {String} strPre - preset string (format: m3;b;b123;AAAA;AAAA)
 */
function loadPreset(strPre) {
    if ( strPre.length > 0 ) {
        var strBeg = 0;
        var strEnd = strPre.length;
        var strVar = strPre.substring(strBeg,strEnd);

        var arrVars = strVar.split(";");

        var mac = arrVars[0]
        var ukw = arrVars[1];
        var rotors = arrVars[2];
        var rings = arrVars[3];
        var ground = arrVars[4];

        document.getElementById('enigma_type').value = mac;

        if (mac == "m4") {
            document.getElementById('use_reflector_thin').value = ukw;
        } else {
            document.getElementById('use_reflector').value = ukw;
        }

        document.getElementById('greek_no').value = rotors.charAt(0);
        document.getElementById('leftw_no').value = rotors.charAt(1);
        document.getElementById('middlew_no').value = rotors.charAt(2);
        document.getElementById('rightw_no').value = rotors.charAt(3);

        document.getElementById('greek_ring').value = rings.charAt(0);
        document.getElementById('leftw_ring').value = rings.charAt(1);
        document.getElementById('middlew_ring').value = rings.charAt(2);
        document.getElementById('rightw_ring').value = rings.charAt(3);

        document.getElementById('greek_set').value = ground.charAt(0);
        document.getElementById('leftw_set').value = ground.charAt(1);
        document.getElementById('middlew_set').value = ground.charAt(2);
        document.getElementById('rightw_set').value = ground.charAt(3);

        var n = 1;
        while (n <= 26) {
            document.getElementById('plug'+n).value = "";
            n++;
        }

        if (arrVars.length > 5) {
            var arrStecker = arrVars[5].split("-");
            var i = 0;
            while (i < arrStecker.length) {
                var a = arrStecker[i].charAt(0).toUpperCase();
                var b = arrStecker[i].charAt(1).toUpperCase();
                var an = ENIGMA.plaintext.indexOf(a);
                var bn = ENIGMA.plaintext.indexOf(b);
                document.getElementById('plug'+an).value = b;
                document.getElementById('plug'+bn).value = a;
                i++;
            }
        }
    }
}

/**
 * Save Preset
 * Save a user preset as a bookmark
 */
function savePreset() {
    var mac = document.getElementById('enigma_type').value;

    // If using M4 Enigma
    if (mac == "m4") {
        var ukw = document.getElementById('use_reflector_thin').value + ";";
    } else {
        var ukw = document.getElementById('use_reflector').value + ";";
    }

    mac =     mac + ";"

    var rot = document.getElementById('greek_no').value
        + document.getElementById('leftw_no').value
        + document.getElementById('middlew_no').value
        + document.getElementById('rightw_no').value + ";";

    var rin = document.getElementById('greek_ring').value
        + document.getElementById('leftw_ring').value
        + document.getElementById('middlew_ring').value
        + document.getElementById('rightw_ring').value + ";";

    var gro = document.getElementById('greek_set').value
        + document.getElementById('leftw_set').value
        + document.getElementById('middlew_set').value
        + document.getElementById('rightw_set').value;

    var stk = "";
    var i = 1;

    while (i <= 26) {
        if (document.getElementById('plug'+i).value != "") {
            var string_rev = toUC('plug'+i) + ENIGMA.plaintext.charAt(i);

            if (stk.indexOf(string_rev) < 0) {
                if (stk != "") {
                    stk = stk + "-";
                } else {
                    stk = ";" + stk;
                }
                stk = stk + ENIGMA.plaintext.charAt(i) + toUC('plug'+i);
            }
        }
        i++;
    }

    var months = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");

    var now = new Date();
    var title = now.getDate() + " " + months[now.getMonth()] + ", " + now.getFullYear() + " "
        + now.getHours() + ":"
        + ((now.getMinutes() < 10) ? "0" : "") + now.getMinutes() + ":"
        + ((now.getSeconds() < 10) ? "0" : "") + now.getSeconds();

    var url = document.URL.replace(/\?.*/gi, "") + "?" + mac + ukw + rot + rin + gro + stk;;

    var savearea = document.getElementById('savearea');

    // Quick'n'dirty use of inner HTML, so sue me!
    savearea.innerHTML = "<p><a href=\"" + url  + "\">Enigma Settings: " + title + "</a><br />\n"
        + "Right-click on the above link and select \"Add to Bookmarks\" (or similar), or "
        + "drag it to your bookmarks folder.</p>";

    savearea.setAttribute("class", "showsave");

}

/**
 * Tidy up after the reset button is pressed
 */
function tidyUp() {
    var i = 1;
    while (i <= 26) {
        // Wipe all previous lights - make font colour grey
        document.getElementById('l_'+ENIGMA.plaintext.charAt(i)).setAttribute('class', 'led_off');
        i++;
    }

    document.getElementById('save').removeAttribute('class');

    var muckyurl = document.URL;
    var cleanurl = muckyurl.replace(/\?.*/gi, "");
    document.location = cleanurl;

    ENIGMA.usedletters = "";
    ENIGMA.lastkeypressed = "";
    ENIGMA.counter = 0;
}

/**
 * Initialise Engima and set-up onload behaviours
 */
function initEnigma() {
    // Do nothing if the DOM not supported
    if (!document.getElementById || !document.getElementsByTagName) { return false; }

    // Hide the non-DOM message
    document.getElementById('jsmsg').style.display = "none";

    ENIGMA = new ENIGMA(); // Grabs global variables as ENIGMA object

    // Local vars
    var i, re, wid, tid, currstatus;

    // Add a configure action to Enigma type selection
    var etype = document.getElementById('enigma_type');
    etype.onchange = function() {
        if (this.value == "m4") {
            document.getElementById('greek_posnum').style.display = "";
            document.getElementById('greek_no').style.display = "";
            document.getElementById('greek_ring').style.display = "";
            document.getElementById('greek_set').style.display = "";
            document.getElementById('use_reflector_thin').style.display = "";
            document.getElementById('urt').style.display = "";
            document.getElementById('use_reflector').style.display = "none";
            document.getElementById('ur').style.display = "none";

        } else  {
            document.getElementById('greek_posnum').style.display = "none";
            document.getElementById('greek_no').style.display = "none";
            document.getElementById('greek_ring').style.display = "none";
            document.getElementById('greek_set').style.display = "none";
            document.getElementById('use_reflector_thin').style.display = "none";
            document.getElementById('urt').style.display = "none";
            document.getElementById('use_reflector').style.display = "";
            document.getElementById('ur').style.display = "";
        }
    }

    // Wheel Settings
    var init_wheels = document.getElementById('wheels');
    var iw = init_wheels.getElementsByTagName('input');

    for (i = 0; i < iw.length; i++) {
        // Add validation function to wheels
        if (iw[i].getAttribute('type') == "text") {
            iw[i].onkeyup = function() {
                wid = this.getAttribute('id');
                validate(wid);
            }
        }
    }

    // Plugboard setting
    var init_plugboard = document.getElementById('plugboard');
    var ip = init_plugboard.getElementsByTagName('input');

    for (i = 0; i< ip.length; i++) {

        ip[i].onkeydown = function() {
            currstatus = this.value;
        }

        // Add the swap plugs function
        ip[i].onkeyup = function() {
            re = /plug([0-9]+)/i
            tid = this.getAttribute('id').replace(re, "$1");

            if (currstatus == "" || ENIGMA.lastkeypressed == 8 || ENIGMA.lastkeypressed == 46) {
                plugboard(tid);
                currstatus = this.value;
            } else {
                if (ENIGMA.lastkeypressed >= 65 && ENIGMA.lastkeypressed <= 90) {
                    this.value = currstatus;
                }
            }
        }
    }

    // Add a the getPreset function to button
    var init_save = document.getElementById('save');
    init_save.onclick = function() {
        if (this.getAttribute('class') == "nosave") return false;
        savePreset();
        return false;
    }

    // Add a the tidyUp function to button
    var init_reset = document.getElementById('clearup');
    init_reset.onclick = function() {
        tidyUp();
        document.getElementById('enigma').reset();
        return false;
    }

    // Set input/output fields to readonly
    document.getElementById('msg_in').setAttribute('readonly', 'readonly');
    document.getElementById('msg_out').setAttribute('readonly', 'readonly');

    // If debug_wiring is on, show form field
    if (ENIGMA.debug_wiring == 1)
    {
        var debug_f = document.getElementById('enigma');
        var debug_p = document.createElement('p')
        var debug_l = document.createTextNode('Debug Window:');
        var debug_b = document.createElement('br');
        var debug_t = document.createElement('textarea');
        debug_t.id = "showDebug";
        debug_t.cols = 40;
        debug_t.rows = 20;
        debug_f.appendChild(debug_p);
        debug_p.appendChild(debug_l);
        debug_p.appendChild(debug_b);
        debug_p.appendChild(debug_t);
    }

    // Are we loading a saved preset?
    var url = document.URL;
    if (url.indexOf('?') > -1) {
        var str_settings = url.substring(url.indexOf("?")+1, url.length);
        loadPreset(str_settings);
    }

    if (document.getElementById('enigma_type').value == "m3") {
        document.getElementById('greek_posnum').style.display = "none";
        document.getElementById('greek_no').style.display = "none";
        document.getElementById('greek_ring').style.display = "none";
        document.getElementById('greek_set').style.display = "none";
        document.getElementById('urt').style.display = "none";
        document.getElementById('use_reflector_thin').style.display = "none";
    } else {
        document.getElementById('ur').style.display = "none";
        document.getElementById('use_reflector').style.display = "none";
    }

    // Add onclick functions to "single" or "block" input radio buttons

    if (ENIGMA.inputmethod == "single") {
        document.getElementById('blockinput').style.display = "none";
    }

    var method_single = document.getElementById('single');
    var method_block = document.getElementById('block');

    method_single.onclick = function() {
        document.getElementById('blockinput').style.display = "none";
        ENIGMA.inputmethod = "single";
    }
    method_block.onclick = function() {
        document.getElementById('blockinput').style.display = "";
        ENIGMA.inputmethod = "block";
    }

    // Enter letter - add the cipher function
    var init_txtinput = document.getElementById('textin');
    init_txtinput.onkeyup = function() {
        if (ENIGMA.inputmethod == "single")
        {
            doCipher();
            if (ENIGMA.lastkeypressed >= 65 && ENIGMA.lastkeypressed <= 90) {
                document.getElementById('save').setAttribute('class', 'nosave');
            }
        }
    }

    var init_startbtn = document.getElementById('startbtn');
    var temp = document.getElementById('textin');
    init_startbtn.onclick = function() {
        if (ENIGMA.inputmethod == "block")
        {
            var init_txtinput = document.getElementById('txt_in').value;
            for (i = 0; i < init_txtinput.length; i++)
            {
                temp.value = init_txtinput.charAt(i);
                doCipher();

                // Break after every 500 chars to stop overloading browser
                // Also stops somebody breaking it by pasting in a novel!
                if (i > 0 && i % 500 == 0) {
                    var cont = confirm("The Enigma Machine is having a breather...\n\n"
                        + "Continue with the rest of the cipher?");

                    if (cont == false) {
                        break;
                    }
                }
            }
            document.getElementById('txt_in').value = ""; // Clear field or next input block
        }
    }
}

/**
 * Store the keypress
 * @param {Object} key
 */
function getKeyIn(key) {
    if (!key) {
        key = event;
        key.which = key.keyCode;
    }
    ENIGMA.lastkeypressed = key.which;
}


/**
 * Add Event by John Resig
 * http://ejohn.org/projects/flexible-javascript-events/
 *
 * @param {Object} obj
 * @param {String} type
 * @param {Function} fn
 */
function addEvent( obj, type, fn ) {
    if ( obj.attachEvent ) {
        obj["e"+type+fn] = fn;
        obj[type+fn] = function() { obj["e"+type+fn]( window.event ); }
        obj.attachEvent( "on"+type, obj[type+fn] );
    } else {
        obj.addEventListener( type, fn, false );
    }
}
/**
 * Remove Event by John Resig
 * http://ejohn.org/projects/flexible-javascript-events/
 *
 * @param {Object} obj
 * @param {String} type
 * @param {Function} fn
 */
function removeEvent( obj, type, fn ) {
    if ( obj.detachEvent ) {
        obj.detachEvent( "on"+type, obj[type+fn] );
        obj[type+fn] = null;
    } else {
        obj.removeEventListener( type, fn, false );
    }
}

// Run add events
addEvent(window, "load", initEnigma);
addEvent(document, "keydown", getKeyIn);