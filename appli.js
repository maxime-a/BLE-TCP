/**
 * @ Author: Maxime Aymonin
 * @ Create Time: 2022-07-14 12:15:56
 * @ Modified by: Maxime Aymonin
 * @ Modified time: 2022-07-14 16:00:45
 * @ Description: A web interface to SmarTrap Serial Port Profile
 */

var SPP = 0x0500;

/**
 * Connection to bluetooth device 
 */
async function connect()
{
    document.getElementById("connect-btn").innerHTML = "Connecting";
    console.log("connecting...");

    let servicesNeeded = [SPP];

    try {
    console.log('Requesting any Bluetooth Device...');
    myDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices : true,
        optionalServices : servicesNeeded});
    myDevice.addEventListener('gattserverdisconnected', disconnect);
    console.log('Connecting to GATT Server...');
    const server = await myDevice.gatt.connect();

    // Note that we could also get all services that match a specific UUID by
    // passing it to getPrimaryServices().
    console.log('Getting Services...');
    const services = await server.getPrimaryServices();

    console.log('Getting Characteristics...');
    for (const service of services) {
        console.log('> Service: ' + service.uuid);
        const characteristics = await service.getCharacteristics();

        characteristics.forEach(characteristic => {
        console.log('>> Characteristic: ' + characteristic.uuid + ' ' +
            getSupportedProperties(characteristic));
        
            switch(characteristic.uuid){
                /* SPP Data */
                case "00000501-0000-1000-8000-00805f9b34fb":
                    characteristic.startNotifications();
                    characteristic.oncharacteristicvaluechanged = handleData;
                    break;
            }
        });
    }

    document.getElementById("connect-btn").innerHTML = "Connected";

    } catch(error) {
    console.log('Argh! ' + error);
    document.getElementById("connect-btn").innerHTML = "Error try again";
    }
}

/** Create a string with the properties of a characteristics */
function getSupportedProperties(characteristic) {
    let supportedProperties = [];
    for (const p in characteristic.properties) {
    if (characteristic.properties[p] === true) {
        supportedProperties.push(p.toUpperCase());
    }
    }
    return '[' + supportedProperties.join(', ') + ']';
}

/** Disconnection handler */
function disconnect()
{
    if (myDevice) {
        myDevice.gatt.disconnect();
        document.getElementById("connect-btn").innerHTML = "Connect";
    }
}

// For the time now
Date.prototype.timeNow = function () {
    return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

/**
 * handle the data notified through the data
 * caracteristic of our Text Communication Profile
 * 
 * @param {Web bluetooth event} event 
 */
function handleData(event) {
    // get the data buffer from the event
    var buf = new Uint8Array(event.target.value.buffer);
    // convert bytes to corresponding char
    msg=new Date().timeNow();
    msg+=" -> ";
    i=0;
    while(buf[i]!=0)
    {
        msg+=String.fromCharCode(buf[i]);
        i++;
    }
    console.log(msg)
    
    msg+="<br />";

    // update UI
    document.getElementById('text').innerHTML  +=   msg;

}