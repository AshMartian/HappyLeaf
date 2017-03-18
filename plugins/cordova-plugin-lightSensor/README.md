
<!---
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
-->

# tools.mango.light

This plugin provides access to the device's light sensor.

## Installation

    cordova plugin add https://github.com/MangoTools/cordova-plugin-lightSensor.git

## Supported Platforms

- Android

## Methods

  window.light =  cordova.require("cordova-plugin-lightSensor.light");

- light.getLightState
- light.enableSensor
- light.disableSensor

## light.getLightState

Get the current lighting value in Lux.

This light state is returned to the 'successCallback' callback function.

    light.getLightState(successCallback);

## light.enableSensor

Enable the proximity sensor. In iOS the proximity sensor is disabled by default and must
be enabled manually.

    light.enableSensor();

## light.disableSensor

Disable the light sensor.

    light.disableSensor();

### Example 1

    function onSuccess(state) {
        alert('Light Sensor state: ' + state);
    };
    
    setInterval(function(){
      window.light.getLightState(onSuccess);
    }, 1000);

