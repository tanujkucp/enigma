import React, {Component} from 'react';
import renderIf from "render-if";
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Chip from '@material-ui/core/Chip';
import {withStyles} from "@material-ui/core";


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

const letters = [];
for (let i = 0; i < 26; i++) {
    let index = String.fromCharCode(i + 65);
    letters.push(index);
}


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
        debug_string_block: '',
        msg_in: '',
        msg_out: '',
        plugboard: '.ABCDEFGHIJKLMNOPQRSTUVWXYZ',

        useReflector: 'b',
        wheel_r: 3,
        wheel_m: 2,
        wheel_l: 1,
        ring_r: 'A',
        ring_m: 'A',
        ring_l: 'A',

        rightw_set: 'A',
        middlew_set: 'A',
        leftw_set: 'A',

        // states for UI
        rOpen: false,
        wOpen1: false,
        wOpen2: false,
        wOpen3: false,
        gOpen: false,

    };

    validLetter = (n) => {
        if (n <= 0) {
            return (26 + n);
        } else if (n > 26) {

            return (n - 26);
        } else return n;
    };

    run_debug = (m, n) => {
        let ds = this.state.debug_string;
        if (m === 1) {
            let output = ds + plaintext.charAt(n);
            // show conversion to user
            console.log(output);
            this.setState({debug_string: output});
        } else this.state.debug_string += plaintext.charAt(n) + " > ";
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

        // Display new values
        this.setState({
            rightw_set: plaintext.charAt(pr), middlew_set: plaintext.charAt(pm),
            leftw_set: plaintext.charAt(pl)
        });

        return [pr, pm, pl];
    };

    swapPlugs = (n) => {
        return plaintext.indexOf(this.state.plugboard.charAt(n));
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
            this.setState({textin: ''});
            return false;
        }

        let ring_r = plaintext.indexOf(this.state.ring_r);
        let ring_m = plaintext.indexOf(this.state.ring_m);
        let ring_l = plaintext.indexOf(this.state.ring_l);

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

        // First Pass - R Wheel
        number = this.mapLetter(number, ring_r, start_r, this.state.wheel_r, 1);

        this.run_debug(0, number);

        // First Pass - M Wheel
        number = this.mapLetter(number, ring_m, start_m, this.state.wheel_m, 1);

        this.run_debug(0, number);

        // First Pass - L Wheel
        number = this.mapLetter(number, ring_l, start_l, this.state.wheel_l, 1);

        this.run_debug(0, number);


        // Reflector
        var let1 = arrReflector[this.state.useReflector].charAt(number);
        number = plaintext.indexOf(let1);

        this.run_debug(0, number);


        // Second Pass - L Wheel
        number = this.mapLetter(number, ring_l, start_l, this.state.wheel_l, 2);

        this.run_debug(0, number);

        // Second Pass - M Wheel
        number = this.mapLetter(number, ring_m, start_m, this.state.wheel_m, 2);

        this.run_debug(0, number);

        // Second Pass - R Wheel
        number = this.mapLetter(number, ring_r, start_r, this.state.wheel_r, 2);

        this.run_debug(0, number);

        // Passes through ETW again

        // Second Pass - Plugboard
        number = this.swapPlugs(number);

        this.run_debug(1, number);

        // Convert value to corresponding letter
        var output = plaintext.charAt(number);

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
        //Increment the counter
        counter++;
        msg_in += letterinput;
        msg_out += output;

        // Spit out new string values
        this.setState({msg_in: msg_in, msg_out: msg_out, counter: counter, textin: '', output: output});

        return true;
    };


    plugboard = (label, input) => {
        console.log(label, '>', input);
        let pg = this.state.plugboard;
        if (input !== "") {
            // Check latter hasn't been used
            if (this.state.plugboard.charAt(plaintext.indexOf(input)) === input) {
                // Fill out the paired letter field.
                //  Eg, if field 'A' is 'D', fill out field 'D' as 'A'
                pg = pg.replaceAt(plaintext.indexOf(label), input);
                pg = pg.replaceAt(plaintext.indexOf(input), label);
            } else {
                // If the input letter has already been used, ignore it and stop running the script.
                alert("You have already used the letter '" + input + "' in a connection.\n"
                    + "Delete its current connection to form a new one.");
            }
        } else {
            // Clear plugs on delete
            let otherchar = pg.charAt(plaintext.indexOf(label));
            pg = pg.replaceAt(plaintext.indexOf(label), label);
            pg = pg.replaceAt(plaintext.indexOf(otherchar), otherchar);
        }
        console.log(pg);
        this.setState({plugboard: pg});
        return true;
    };

    clearSettings = () => {
        //reset the state
        window.location.reload();
    };

    validateChar = (ch) => {
        if (ch.length > 1) ch = ch.charAt(ch.length - 1);
        if (plaintext.indexOf(ch) < 1) return '';
        else return ch;
    };

    /////////////////////////// creating upload file method //////////////////////////
    fileReader;
    handleFileRead = (e) => {
        let content = this.fileReader.result;
        console.log(content);
        //feed this into enigma machine
        //create a debug_string_block string
        let debug = 'STARTING ENCRYPTION\n\nSETTINGS\n';
        debug += 'Reflector Wheel: ' + this.state.useReflector + '\n';
        debug += 'Wheel Order: ' + this.state.wheel_l + ' ' + this.state.wheel_m + ' ' + this.state.wheel_r + '\n';
        debug += 'Ring Setting: ' + this.state.ring_l + ' ' + this.state.ring_m + ' ' + this.state.ring_r + '\n';
        debug += 'Ground Setting: ' + this.state.leftw_set + ' ' + this.state.middlew_set + ' ' + this.state.rightw_set + '\n';
        debug += 'Plug Board: ' + this.state.plugboard + '\n';
        debug += 'Grouping: ' + this.state.grouping + '\n';
        debug += '\nINPUT MESSAGE\n' + content + '\n';
        debug += '\nLOGS';


        this.setState({msg_in: '', msg_out: '', debug_string_block: debug}, () => {
            let time = 100;
            for (let i = 0; i < content.length; i++) {
                let cin = this.validateChar(content[i].toUpperCase());
                if (cin !== '') {
                    setTimeout(() => {
                        this.setState({
                            textin: cin,
                            debug_string_block: this.state.debug_string_block + '\n' + this.state.debug_string,
                            debug_string: ''
                        }, () => this.doCipher());
                    }, time);
                    time += 100;

                }
            }
            //print the cipher text to the output file
            setTimeout(() => {
                let debug = this.state.debug_string_block;
                debug += '\n' + this.state.debug_string;
                debug += '\n\nFINISHED ENCRYPTION\n\nCIPHER TEXT\n' + this.state.msg_out;
                //console.log(debug);
                console.log(this.state.msg_out);
                let blob = new Blob([debug], {type: 'text/plain'});
                var link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.style = "visibility:hidden";
                link.download = 'cipher.txt';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, 100 * content.length + 50);
        });

    };
    handleFileChosen = (file) => {
        this.fileReader = new FileReader();
        this.fileReader.onloadend = this.handleFileRead;
        this.fileReader.readAsText(file);
    };

    render() {
        return (
            <div className="App">

                <React.Fragment>
                    <Container maxWidth={'100%'} style={{backgroundColor: '#282c34', height: '100%'}}>

                        <Grid container style={{height: '100%'}} spacing={2} justify={'space-between'}
                              direction={'row'}>

                            <Grid item xs={12}>
                                {/*            Paper for plugboard              */}
                                <Paper style={{height: 150, backgroundColor: '#e2e2e2', marginTop: 10}}>
                                    <Typography variant="h6" gutterBottom style={{marginTop: 10, textAlign: 'center'}}>
                                        Steckerbrett ( Plug Board )
                                    </Typography>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        flexWrap: 'wrap', paddingLeft: 10
                                    }}>
                                        {renderIf(this.state.plugboard !== null)(() => (
                                            letters.map((v) => (
                                                <ListItem key={v} text={v}
                                                          state={this.state}
                                                          validateChar={this.validateChar}
                                                          plugboard={this.plugboard}
                                                />))
                                        ))}

                                    </div>

                                </Paper>
                            </Grid>
                            <Grid item xs={4}>
                                {/*                    Paper for Settings                  */}
                                <Paper style={{height: 500, backgroundColor: '#e2e2e2', paddingTop: 20}}>
                                    <div style={{marginLeft: 10}}>

                                        {/*           Umkehrwalze starts            */}

                                        <Typography variant="h6" gutterBottom>
                                            Umkehrwalze :
                                            <Select open={this.state.rOpen} onClose={() => {
                                                this.setState({rOpen: false})
                                            }}
                                                    onOpen={() => {
                                                        this.setState({rOpen: true})
                                                    }}
                                                    value={this.state.useReflector}
                                                    onChange={(event) => {
                                                        this.setState({useReflector: event.target.value})
                                                    }}
                                                    style={{marginLeft: 20, backgroundColor: '#efefef'}}>
                                                <MenuItem value={'b'}>- - - B - - -</MenuItem>
                                                <MenuItem value={'c'}>- - - C - - -</MenuItem>
                                            </Select>
                                            <InputLabel style={{fontSize: 13, marginTop: -5}}>Reflector
                                                Wheel</InputLabel>

                                        </Typography>
                                    </div>

                                    {/*            Walzenlage starts               */}

                                    <div style={{marginLeft: 10, marginTop: 10}}>
                                        <Typography variant="h6" gutterBottom>
                                            Walzenlage :
                                            <Select open={this.state.wOpen1}
                                                    onClose={() => {
                                                        this.setState({wOpen1: false})
                                                    }}
                                                    onOpen={() => {
                                                        this.setState({wOpen1: true})
                                                    }}
                                                    value={this.state.wheel_l}
                                                    onChange={(event) => {
                                                        this.setState({wheel_l: event.target.value})
                                                    }}
                                                    style={{marginLeft: 35, backgroundColor: '#efefef'}}
                                            >
                                                <MenuItem value={1}>I</MenuItem>
                                                <MenuItem value={2}>II</MenuItem>
                                                <MenuItem value={3}>III</MenuItem>
                                                <MenuItem value={4}>IV</MenuItem>
                                                <MenuItem value={5}>V</MenuItem>
                                            </Select>
                                            <Select
                                                open={this.state.wOpen2}
                                                onClose={() => {
                                                    this.setState({wOpen2: false})
                                                }}
                                                onOpen={() => {
                                                    this.setState({wOpen2: true})
                                                }}
                                                value={this.state.wheel_m}
                                                onChange={(event) => {
                                                    this.setState({wheel_m: event.target.value})
                                                }}
                                                style={{marginLeft: 20, backgroundColor: '#efefef'}}
                                            >
                                                <MenuItem value={1}>I</MenuItem>
                                                <MenuItem value={2}>II</MenuItem>
                                                <MenuItem value={3}>III</MenuItem>
                                                <MenuItem value={4}>IV</MenuItem>
                                                <MenuItem value={5}>V</MenuItem>
                                            </Select>
                                            <Select
                                                open={this.state.wOpen3}
                                                onClose={() => {
                                                    this.setState({wOpen3: false})
                                                }}
                                                onOpen={() => {
                                                    this.setState({wOpen3: true})
                                                }}
                                                value={this.state.wheel_r}
                                                onChange={(event) => {
                                                    this.setState({wheel_r: event.target.value})
                                                }}
                                                style={{marginLeft: 20, backgroundColor: '#efefef'}}
                                            >
                                                <MenuItem value={1}>I</MenuItem>
                                                <MenuItem value={2}>II</MenuItem>
                                                <MenuItem value={3}>III</MenuItem>
                                                <MenuItem value={4}>IV</MenuItem>
                                                <MenuItem value={5}>V</MenuItem>
                                            </Select>

                                            <InputLabel style={{fontSize: 13, marginTop: -5}}>Wheel Order</InputLabel>

                                        </Typography>
                                    </div>

                                    {/*            Ring setting start            */}

                                    <div style={{marginLeft: 10, marginTop: 10}}>
                                        <Typography variant="h6" gutterBottom>
                                            Ringstellung :

                                            <TextField
                                                value={this.state.ring_l}
                                                defaultValue={'A'}
                                                onChange={(event) => {
                                                    this.setState({ring_l: this.validateChar(event.target.value.toUpperCase())})
                                                }}
                                                style={{width: 40, marginLeft: 30, backgroundColor: '#efefef'}}
                                            />
                                            <TextField
                                                value={this.state.ring_m}
                                                defaultValue={'A'}
                                                onChange={(event) => {
                                                    this.setState({ring_m: this.validateChar(event.target.value.toUpperCase())})
                                                }}
                                                style={{width: 40, marginLeft: 20, backgroundColor: '#efefef'}}
                                            />
                                            <TextField
                                                value={this.state.ring_r}
                                                defaultValue={'A'}
                                                onChange={(event) => {
                                                    this.setState({ring_r: this.validateChar(event.target.value.toUpperCase())})
                                                }}
                                                style={{width: 40, marginLeft: 20, backgroundColor: '#efefef'}}
                                            />

                                            <InputLabel style={{fontSize: 13, marginTop: -5}}>Ring Setting</InputLabel>
                                        </Typography>
                                    </div>

                                    {/*              Ground Setting Start                 */}

                                    <div style={{marginLeft: 10, marginTop: 10}}>
                                        <Typography variant="h6" gutterBottom>
                                            Grundstellung :

                                            <TextField
                                                value={this.state.leftw_set}
                                                defaultValue={'A'}
                                                onChange={(event) => {
                                                    this.setState({leftw_set: this.validateChar(event.target.value.toUpperCase())})
                                                }}
                                                style={{width: 40, marginLeft: 15, backgroundColor: '#efefef'}}
                                            />
                                            <TextField
                                                value={this.state.middlew_set}
                                                defaultValue={'A'}
                                                onChange={(event) => {
                                                    this.setState({middlew_set: this.validateChar(event.target.value.toUpperCase())})
                                                }}
                                                style={{width: 40, marginLeft: 20, backgroundColor: '#efefef'}}
                                            />
                                            <TextField
                                                value={this.state.rightw_set}
                                                defaultValue={'A'}
                                                onChange={(event) => {
                                                    this.setState({rightw_set: this.validateChar(event.target.value.toUpperCase())})
                                                }}
                                                style={{width: 40, marginLeft: 20, backgroundColor: '#efefef'}}
                                            />

                                            <InputLabel style={{fontSize: 13, marginTop: -5}}>Ground
                                                Setting</InputLabel>
                                        </Typography>
                                    </div>

                                    {/*             Input Method Start            */}
                                    <div style={{marginLeft: 10, marginTop: 20}}>
                                        <FormControl component="fieldset">
                                            <FormLabel component="legend">Input Method</FormLabel>
                                            <RadioGroup
                                                aria-label="Input Method"
                                                name="inputmethod"
                                                value={this.state.inputmethod}
                                                onChange={(event) => {
                                                    this.setState({inputmethod: event.target.value})
                                                }}
                                                row>
                                                <FormControlLabel value="single" control={<Radio/>}
                                                                  label="Character"/>
                                                <FormControlLabel value="multiple" control={<Radio/>} label="Block"/>
                                                <FormControlLabel value="file" control={<Radio/>} label="File"/>
                                            </RadioGroup>
                                        </FormControl>
                                    </div>

                                    {/*           Grouping letters start            */}

                                    <div style={{marginLeft: 10, marginTop: 10}}>
                                        <Typography variant="h6" gutterBottom>
                                            Grouping of letters :
                                            <Select open={this.state.gOpen}
                                                    onClose={() => {
                                                        this.setState({gOpen: false})
                                                    }}
                                                    onOpen={() => {
                                                        this.setState({gOpen: true})
                                                    }}
                                                    value={this.state.grouping}
                                                    onChange={(event) => {
                                                        this.setState({grouping: event.target.value})
                                                    }}
                                                    style={{marginLeft: 30, backgroundColor: '#efefef', width: 40}}
                                            >
                                                <MenuItem value={3}>3</MenuItem>
                                                <MenuItem value={4}>4</MenuItem>
                                                <MenuItem value={5}>5</MenuItem>
                                                <MenuItem value={6}>6</MenuItem>
                                            </Select>
                                        </Typography>
                                    </div>

                                    <div style={{marginLeft: 10, marginTop: 10}}>
                                        <Button variant="contained" onClick={this.clearSettings}>
                                            Clear Settings
                                        </Button>
                                    </div>

                                </Paper>
                            </Grid>
                            <Grid item xs={8}>
                                {/*              Paper for Enigma working           */}
                                <Paper style={{height: 500, backgroundColor: '#e2e2e2'}}>
                                    <div style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        <TextField
                                            value={this.state.msg_in}
                                            style={{width: '80%', backgroundColor: '#efefef', marginTop: 20}}
                                            variant={'outlined'}
                                            label={'Plain Text'}
                                            disabled={this.state.inputmethod !== 'multiple'}
                                            onChange={(event) => {
                                                this.setState({msg_in: event.target.value.toUpperCase()});
                                            }}
                                        />
                                        <TextField
                                            value={this.state.msg_out}
                                            style={{width: '80%', backgroundColor: '#efefef', marginTop: 20}}
                                            variant={'outlined'}
                                            label={'Cipher Text'}
                                            disabled
                                        />
                                    </div>
                                    <div style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        display: 'flex',
                                        marginTop: 30
                                    }}>
                                        {renderIf(this.state.inputmethod === 'single')(() => (
                                            <CssTextField
                                                label="Enter Character"
                                                value={this.state.textin}
                                                variant="outlined"
                                                disabled={this.state.inputmethod !== 'single'}
                                                onChange={(event) => {
                                                    let cin = this.validateChar(event.target.value.toUpperCase());
                                                    if (cin !== '') {
                                                        this.setState({
                                                            textin: cin,
                                                            debug_string: ''
                                                        }, () => this.doCipher());
                                                    }
                                                }}
                                                style={{width: 150}}
                                            />
                                        ))}


                                        {renderIf(this.state.inputmethod === 'multiple')(() => (
                                            <Button variant="contained"
                                                    onClick={() => {

                                                        //feed characters one bye one into cipher
                                                        let text = this.state.msg_in;
                                                        this.setState({msg_in: '', msg_out: ''}, () => {
                                                            let time = 100;
                                                            for (let i = 0; i < text.length; i++) {
                                                                let cin = this.validateChar(text[i].toUpperCase());
                                                                if (cin !== '') {
                                                                    setTimeout(() => {
                                                                        this.setState({
                                                                            textin: cin,
                                                                            debug_string: ''
                                                                        }, () => this.doCipher());
                                                                    }, time);
                                                                    time += 100;

                                                                }
                                                            }
                                                        });

                                                    }}
                                                    color={'primary'}
                                                    style={{marginLeft: 10, padding: 15}}>
                                                Encipher Block
                                            </Button>
                                        ))}

                                        {renderIf(this.state.inputmethod === 'file')(() => (
                                            <input
                                                type='file'
                                                id={'file'}
                                                className={'input-file'}
                                                accept={'.txt'}
                                                onChange={e => this.handleFileChosen(e.target.files[0])}
                                            />
                                        ))}

                                    </div>
                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                        <Typography variant="h6" gutterBottom style={{marginTop: 100, marginLeft: 10}}>
                                            Conversion : {this.state.debug_string}
                                        </Typography>
                                    </div>
                                </Paper>
                            </Grid>
                        </Grid>


                    </Container>
                </React.Fragment>


            </div>

        );
    }


}


class ListItem extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        let otherchar = this.props.state.plugboard.charAt(plaintext.indexOf(this.props.text));
        return (
            <div style={{flexDirection: 'column', display: 'flex'}}>
                <Chip
                    key={this.props.text}
                    label={this.props.text}
                    color={'primary'}
                    style={{marginLeft: 15, flex: 1, margin: 5, paddingTop: 10, paddingBottom: 10}}
                />
                <TextField
                    value={(this.props.text === otherchar) ? '' : otherchar}
                    style={{width: 40, flex: 1, marginLeft: 7}}
                    onChange={(event) => {
                        let cin = this.props.validateChar(event.target.value.toUpperCase());
                        this.props.plugboard(this.props.text, cin);
                    }}
                />
            </div>
        );
    }
}

String.prototype.replaceAt = function (index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
};

const CssTextField = withStyles({
    root: {
        '& label.Mui-focused': {
            color: 'green',
        },
        '& .MuiInput-underline:after': {
            borderBottomColor: 'green',
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'red',
            },
            '&:hover fieldset': {
                borderColor: 'yellow',
            },
            '&.Mui-focused fieldset': {
                borderColor: 'green',
            },
        },
    },
})(TextField);


export default Home;
