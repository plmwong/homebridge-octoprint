var rp = require("request-promise");
var Service, Characteristic;

module.exports = function(homebridge) {
  console.log("homebridge API version: " + homebridge.version);

  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory("homebridge-octoprint", "Octoprint", OctoprintAccessory);
};

function OctoprintAccessory(log, config, api) {
  this.log = log;
  this.name = config["name"];
  this.server = config["server"] || 'http://octopi.local';
  this.apiKey = config["api_key"];

  this.accessories = [];
  this.service = new Service.Thermostat(this.name);

  //Required
  this.service
    .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
    .on('get', this.getCurrentHeatingCoolingState.bind(this))
    .on('set', this.setCurrentHeatingCoolingState.bind(this));

	this.service
		.getCharacteristic(Characteristic.TargetHeatingCoolingState)
		.on('get', this.getTargetHeatingCoolingState.bind(this))
		.on('set', this.setTargetHeatingCoolingState.bind(this));

  this.service
    .getCharacteristic(Characteristic.CurrentTemperature)
    .on('get', this.getCurrentTemperature.bind(this));

	this.service
		.getCharacteristic(Characteristic.TargetTemperature)
		.on('get', this.getTargetTemperature.bind(this))
		.on('set', this.setTargetTemperature.bind(this));

  this.service
		.getCharacteristic(Characteristic.TemperatureDisplayUnits)
		.on('get', this.getTemperatureDisplayUnits.bind(this))
		.on('set', this.setTemperatureDisplayUnits.bind(this));

  //Optional
	this.service
		.getCharacteristic(Characteristic.Name)
		.on('get', this.getName.bind(this));
}

OctoprintAccessory.prototype.identify = function(callback) {
  this.log('Identify requested');
  callback(null);
};

//Required
OctoprintAccessory.prototype.getCurrentHeatingCoolingState = function(callback) {
  this.log('Getting current heating cooling state... GET ' + this.server + '/api/printer');

  var options = {
    method: 'GET',
    uri: this.server + '/api/printer',
    headers: {
      "X-Api-Key": this.apiKey
    },
    json: true
  };

  rp(options)
    .then(function(printerState) {
      console.log('Retrieved printer state: ' + JSON.stringify(printerState));
      var currentTemperature = printerState.temps.tool0.actual;
      var targetTemperature = printerState.temps.tool0.target;

      if (targetTemperature > currentTemperature) {
        callback(null, Characteristic.CurrentHeatingCoolingState.HEAT);
      } else {
        callback(null, Characteristic.CurrentHeatingCoolingState.COOL);
      }
    })
    .catch(function(error) {
      callback(error);
    });
};

OctoprintAccessory.prototype.setCurrentHeatingCoolingState = function(value, callback) {
  callback(null);
};

OctoprintAccessory.prototype.getTargetHeatingCoolingState = function(callback) {
  callback(null, Characteristic.TargetHeatingCoolingState.AUTO);
};

OctoprintAccessory.prototype.setTargetHeatingCoolingState = function(value, callback) {
  callback(null);
};

OctoprintAccessory.prototype.getCurrentTemperature = function(callback) {
  this.log('Getting current temperature... GET ' + this.server + '/api/printer');

  var options = {
    method: 'GET',
    uri: this.server + '/api/printer',
    headers: {
      "X-Api-Key": this.apiKey
    },
    json: true
  };

  rp(options)
    .then(function(printerState) {
      console.log('Retrieved current printer state: ' + JSON.stringify(printerState));
      var currentTemperature = printerState.temps.tool0.actual;
      callback(null, currentTemperature);
    })
    .catch(function(error) {
      callback(error);
    });
};

OctoprintAccessory.prototype.getTargetTemperature = function(callback) {
  this.log('Getting target temperature... GET ' + this.server + '/api/printer');

  var options = {
    method: 'GET',
    uri: this.server + '/api/printer',
    headers: {
      "X-Api-Key": this.apiKey
    },
    json: true
  };

  rp(options)
    .then(function(printerState) {
      console.log('Retrieved target printer state: ' + JSON.stringify(printerState));
      var targetTemperature = printerState.temps.tool0.target;
      callback(null, targetTemperature);
    })
    .catch(function(error) {
      callback(error);
    });
};

OctoprintAccessory.prototype.setTargetTemperature = function(value, callback) {
  this.log('Setting target temperature... GET ' + this.server + '/api/printer');

  var options = {
    method: 'POST',
    uri: this.server + '/api/printer/tool',
    headers: {
      "X-Api-Key": this.apiKey
    },
    body: {
      "command": "target",
      "targets": {
        "tool0": value
      }
    },
    json: true
  };

  rp(options)
    .then(function() {
      console.log('Successfully set target temperature to ' + value);
      callback(null);
    })
    .catch(function(error) {
      callback(error);
    });
};

OctoprintAccessory.prototype.getTemperatureDisplayUnits = function(callback) {
  callback(null, Characteristic.TemperatureDisplayUnits.CELSIUS);
};

OctoprintAccessory.prototype.setTemperatureDisplayUnits = function(value, callback) {
  callback(null);
};

//Optional
OctoprintAccessory.prototype.getName = function(callback) {
  callback(null, this.name);
};

OctoprintAccessory.prototype.getServices = function() {
  return [this.service];
};
