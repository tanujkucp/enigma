import React, {Component} from 'react';
import renderIf from "render-if";
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

import './App.css';


////////////////////////////////////// ENIGMA CONSTANTS /////////////////////////////////////////

const plaintext = ".ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Rotor Wiring
const arrRotors = [];
arrRotors[1] = ".EKMFLGDQVZNTOWYHXUSPAIBRCJ";   // Rotor I
arrRotors[2] = ".AJDKSIRUXBLHWTMCQGZNPYFVOE";   // Rotor II
arrRotors[3] = ".BDFHJLCPRTXVZNYEIWGAKMUSQO";   // Rotor III
arrRotors[4] = ".ESOVPZJAYQUIRHXLNFTGKDCMWB";   // Rotor IV
arrRotors[5] = ".VZBRGITYUPSDNHLXAWMJQOFECK";   // Rotor V


//Knock points of rotors
const arrKnockpoints = [];
arrKnockpoints[1] = 17;//   Q - one knockpoint (R I)
arrKnockpoints[2] = 5;   //   E - one knockpoint (R II)
arrKnockpoints[3] = 22; //   V - one knockpoint (R III)
arrKnockpoints[4] = 10; //   J - one knockpoint (R IV)
arrKnockpoints[5] = 26; //   Z - one knockpoint (R V)

// Reflectors "B" and "C"  Wiring
const arrReflector = [];
arrReflector["b"] = ".YRUHQSLDPXNGOKMIEBFZCWVJAT";      // M3 B
arrReflector["c"] = ".FVPJIAOYEDRZXWGCTKUQSBNMHL";      // M3 C


class Home extends Component {
    // all state variables
    state = {
        inputmethod: "single",
        output: null,
        usedletters: '',
        counter: 0,
        grouping: 4,
        textin: '',
        debug_string: '',
        msg_in: '',
        msg_out: '',
        plugboard: null,

        useReflector: 'b',
        wheel_r: 3,
        wheel_m: 2,
        wheel_l: 1,
        ring_r: 1,
        ring_m: 1,
        ring_l: 1,

        rightw_set: '',
        middlew_set: '',
        leftw_set: '',

    };

    validLetter = (n) => {
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
    };

    run_debug = (m, n) => {
        let ds = this.state.debug_string;
        if (m === 1) {
            let output = ds + plaintext.charAt(n);

            // show conversion to user
            console.log(output);
            this.setState({debug_string: output});
        } else this.setState({debug_string: ds + plaintext.charAt(n) + " > "});
    };

    rotateCogs = (r, m) => {
        var pr = plaintext.indexOf(this.state.rightw_set.toUpperCase());
        var pm = plaintext.indexOf(this.state.middlew_set.toUpperCase());
        var pl = plaintext.indexOf(this.state.leftw_set.toUpperCase());

        if (pr === arrKnockpoints[r]) {
            // If the knockpoint on the right wheel is reached rotate middle wheel
            // But first check if it too is a knock point
            if (pm === arrKnockpoints[m]) {
                // If the knockpoint on the middle wheel is reached rotate left wheel
                pl++;
            }
            pm++;
        } else {
            if (pm === arrKnockpoints[m]) {
                // If the knockpoint on the middle wheel is reached rotate left AND middle wheels
                // (the double stepping mechanism)
                pl++;
                pm++;
            }
        }

        // Rotate right wheel (this wheel is always rotated).
        pr++;

        // If rotating brings us beyond "Z" (26), then start at "A" (1) again.
        if (pr > 26) {
            pr = 1;
        }
        if (pm > 26) {
            pm = 1;
        }
        if (pl > 26) {
            pl = 1;
        }

        // Display new values in browser
        this.setState({
            rightw_set: plaintext.charAt(pr), middlew_set: plaintext.charAt(pm),
            leftw_set: plaintext.charAt(pl)
        });

        // Make values available to the rest of the script as an array.
        return [pr, pm, pl];
    };

    swapPlugs = (n) => {
        let plug_n = this.state.plugboard['A' + n];
        if (plug_n == null) {
            // If the input letter is blank (ie, self-steckered), output the letter unchanged.
            return n;
        } else {
            // Otherwise do the swapsies!
            return plaintext.charAt(plug_n);
        }
    };

    mapLetter = (number, ringstellung, wheelposition, wheel, pass) => {
        // Change number according to ringstellung (ring setting)
        // Wheel turns anti-clockwise (looking from right)
        number = number - ringstellung;

        // Check number is between 1 and 26
        number = this.validLetter(number);

        // Change number according to wheel position
        // Wheel turns clockwise (looking from right)
        number = number + wheelposition;

        // Check number is between 1 and 26
        number = this.validLetter(number);

        // Do internal connection 'x' to 'y' according to direction
        if (pass === 2) {
            // L->R
            let let1 = plaintext.charAt(number);
            number = arrRotors[wheel].indexOf(let1);
        } else {
            // R->L
            let let1 = arrRotors[wheel].charAt(number);
            number = plaintext.indexOf(let1);
        }

        /*
         * NOW WORK IT BACKWARDS : subtract where we added and vice versa
         */

        // Change according to wheel position (anti-clockwise)
        number = number - wheelposition;

        // Check number is between 1 and 26
        number = this.validLetter(number);

        // Change according to ringstellung (clockwise)
        number = number + ringstellung;

        // Check number is between 1 and 26
        number = this.validLetter(number);

        return number;
    };

    doCipher = () => {
        // Are the selected rotors all different?
        if (this.state.wheel_r === this.state.wheel_m ||
            this.state.wheel_r === this.state.wheel_l ||
            this.state.wheel_m === this.state.wheel_l) {
            alert("Wheel Numbers must be unique. Eg, I II III not II II II");
            return false;
        }

        // Get input letter
        var letterinput = this.state.textin.toUpperCase();

        if (letterinput.search(/[A-Z]/gi)) {
            // If input is not a letter [A-Z], then return false and do nothing
            // except clear and focus the letter input field
            this.setState({textin: ''});
            return false;
        }

        // Rotate Wheels (wheel_r and wheel_m have knock points, so we pass them to function)
        var wheel_position = this.rotateCogs(this.state.wheel_r, this.state.wheel_m);

        // Wheel Starting Position
        var start_r = wheel_position[0];
        var start_m = wheel_position[1];
        var start_l = wheel_position[2];

        // Input
        var input = plaintext.indexOf(letterinput);

        this.run_debug(0, input);

        // First Pass - Plugboard
        var number = this.swapPlugs(input);

        this.run_debug(0, number);

        // Passes through ETW which acts as a static converter from plugboard wires to wheels
        // So:  Plugboard --> ETW --> Right Wheel
        // A -->  A  --> A

        // First Pass - R Wheel
        number = this.mapLetter(number, this.state.ring_r, start_r, this.state.wheel_r, 1);

        this.run_debug(0, number);

        // First Pass - M Wheel
        number = this.mapLetter(number, this.state.ring_m, start_m, this.state.wheel_m, 1);

        this.run_debug(0, number);

        // First Pass - L Wheel
        number = this.mapLetter(number, this.state.ring_l, start_l, this.state.wheel_l, 1);

        this.run_debug(0, number);


        // Reflector
        var let1 = arrReflector[this.state.useReflector].charAt(number);
        number = plaintext.indexOf(let1);

        this.run_debug(0, number);


        // Second Pass - L Wheel
        number = this.mapLetter(number, this.state.ring_l, start_l, this.state.wheel_l, 2);

        this.run_debug(0, number);

        // Second Pass - M Wheel
        number = this.mapLetter(number, this.state.ring_m, start_m, this.state.wheel_m, 2);

        this.run_debug(0, number);

        // Second Pass - R Wheel
        number = this.mapLetter(number, this.state.ring_r, start_r, this.state.wheel_r, 2);

        this.run_debug(0, number);

        // Passes through ETW again

        // Second Pass - Plugboard
        number = this.swapPlugs(number);

        this.run_debug(1, number);

        // Convert value to corresponding letter
        var output = plaintext.charAt(number);

        // Clean number
        number = '';

        // Build Message Strings for Input and Output
        let msg_in = this.state.msg_in;
        let msg_out = this.state.msg_out;
        let counter = this.state.counter;

        if (this.state.counter === this.state.grouping) {
            // Space out message in/out as letter blocks of X length (grouping)
            msg_in = msg_in + " ";
            msg_out = msg_out + " ";
            counter = 0;
        }

        // Increment counter
        counter++;

        // Spit out new string values
        this.setState({msg_in: msg_in, msg_out: msg_out, counter: counter, textin: '', output: output});

        return true;
    };

    validate = (label, input) => {
        let pg = this.state.plugboard;
        if (input.search(/[A-Z]/gi) || label === input) {
            // If the input is not a letter clear field, focus on it and stop processing.
            pg[label] = null;
        }// Otherwise make it a capital letter
        else pg[label] = input.toUpperCase();

        this.setState({plugboard: pg});
        return true;
    };

    plugboard = (label, input) => {
        this.validate(label, input); // make sure letter is A-Z
        let pg = this.state.plugboard;
        if (input !== "") {
            // Check latter hasn't been used
            if (this.state.plugboard[input] == null) {
                // Fill out the paired letter field.
                //  Eg, if field 'A' is 'D', fill out field 'D' as 'A'
                pg[input] = label;
                // this.setState({plugboard: pg});
            } else {
                // If the input letter has already been used, ignore it and stop running the script.
                alert("You have already used the letter '" + input + "' in a connection.\n"
                    + "Delete its current connection to form a new one.");
                pg[label] = null;
                // this.setState({plugboard: pg});
                // return false;
            }
            // this.setState({plugboard: pg});
        } else {
            // if (ENIGMA.lastkeypressed == 8 || ENIGMA.lastkeypressed == 46) {
            // Clear plugs on delete
            pg[label] = null;
            pg[input] = null;
            // this.setState({plugboard: pg});
            // }
        }

        this.setState({plugboard: pg});
        return true;
    };

    clearSettings = () => {
        //todo reset the state
        // this.setState({});
        window.location.reload(1);
    };

    componentDidMount() {
        //todo initialize the canvas and ENIGMA settings
        //initialize plugboard
        let pb = [];
        for (let i = 0; i < 26; i++) {
            let index = String.fromCharCode(i + 65);
            pb[index] = null;
            //console.log(index);
        }
        this.setState({plugboard: pb});

        // console.log(this.state);


    };

    render() {
        return (
            <div className="App">

                <React.Fragment>
                    <Container maxWidth={'100%'} style={{ backgroundColor: '#282c34', height: '100vh'}}>

                    </Container>
                </React.Fragment>


            </div>

        );
    }
}

class ListItem extends Component {
    render() {
        return (
            <div>
                <Button variant="contained" color="primary">
                    Hello World
                </Button>
            </div>
        );
    }
}

export default Home;
