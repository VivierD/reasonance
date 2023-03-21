import { MuseInfo, MuseDeviceOptions } from './utils.mjs' ;
import { fft, powerByBand } from "@neurosity/pipes" ;
import { fromEvent } from "rxjs" ;
var events = require("events") ;

class Electrode {

    constructor(aChannelName, aIndex) {
        this.index = aIndex ;
        this.channelName = aChannelName ;
        this.buffer = [] ;
        this.emitter = new events.EventEmitter() ;
        this.eeg = fromEvent(this.emitter, 'data').pipe(fft({bins: 256}), powerByBand()).subscribe(powerByPower => this.StorePowerBands(powerByPower)) ;
        this.rawValues = [] ;
        this.arrayOriginValues = [] ;
        this.powerBands = {
          delta : 0,
          theta : 0,
          alpha : 0,
          beta : 0,
          gamma : 0,
          total : 1,
        }
    }

    emitterEmit(data) {
        this.emitter.emit('data', data) ;
    }

    handleCharacteristicValueChanged = (event) => {

        let value = event.target.value;
        let samples = new Uint8Array(value.buffer);
        const samples12Bit = [];

        for (let i = 2; i < samples.length; i++)
        {
            if ((i - 2) % 3 === 0)
            {
                samples12Bit.push(samples[i + 2] << 4 | samples[i + 3] >> 4);
            }
            else
            {
                samples12Bit.push((samples[i + 2] & 0xf) << 8 | samples[i + 3]);
                i++;
            }
        }

        samples12Bit.map((n) => this.buffer.push(0.48828125 * (n - 0x800))) ;
        this.rawValues = samples12Bit ;

        if (this.buffer.length >= 256)
        {
            var chunk = this.buffer.slice(0, 256) ;
            this.buffer = this.buffer.slice(128);
            const data = {
                data: [chunk],
                info: {
                    samplingRate: 256,
                    startTime: 0,
                    channelNames: [this.channelName]
                }
            }
            this.emitterEmit(data, this.channelName);
        }
    } ;

    StorePowerBands(PSDs) {

        let _delta = PSDs.delta[0];
        let _theta = PSDs.theta[0];
        let _alpha = PSDs.alpha[0];
        let _beta = PSDs.beta[0];
        let _gamma = PSDs.gamma[0];

        let _total = _delta + _theta + _alpha + _beta + _gamma ;       

        if (_total !== 0)
        {
          this.powerBands = {
            delta : _delta,
            theta : _theta,
            alpha : _alpha,
            beta : _beta,
            gamma : _gamma,
            total : _total,
          }
        }
    }

    GetPowerBands() {
      return this.powerBands ;
    }
}

export default class Muse {

    constructor(statusCallback, dataCallback)
    {
        this.primaryService = MuseInfo.primaryService ;
        this.characteristics = MuseInfo.characteristics ;
        this.museDeviceOptions = MuseDeviceOptions ;
        this.currentDevice = undefined ;
        this.statusCallback = statusCallback ;
        this.dataCallback = dataCallback ;

        this.bufferLength = 60 ;
        this.smoothingCoefficient = 0.99 ;

        this.electrodes = {
            'tp9' : new Electrode("tp9", 1),
            'tp10' : new Electrode("tp10", 2),
            'af7' : new Electrode("af7", 0),
            'af8' : new Electrode("af8", 3),
        }

        this.buffers = {
            'alpha' : Array(this.bufferLength).fill(1000),
            'theta' : Array(this.bufferLength).fill(1000),
            'beta' : Array(this.bufferLength).fill(1000),
            'gamma' : Array(this.bufferLength).fill(1000),
        }

        this.powerBands = {
            'delta' : [0, 0, 0, 0],
            'theta' : [0, 0, 0, 0],
            'alpha' : [0, 0, 0, 0],
            'beta' : [0, 0, 0, 0],
            'gamma' : [0, 0, 0, 0],
            'total' : [0, 0, 0, 0],
        }
    
        this.metrics = {
            raw : {
                'alpha' : 0,
                'theta' : 0,
                'beta' : 0,
                'gamma' : 0,
            },
            normalized : {
                'alpha' : 0,
                'theta' : 0,
                'beta' : 0,
                'gamma' : 0,
            },
            smoothed : {
                'alpha' : 0,
                'theta' : 0,
                'beta' : 0,
                'gamma' : 0,
            }
        }
    }

    ClampData = (data, _min = 0.15, _max = 0.30) => {

        data = (data - _min) / (_max - _min) ;

        if (data < 0)
            data = 0 ;
        if (data > 1)
            data = 1 ;
        return data + 1 ;
    }

    SendData = () => {

        setInterval(() => {
            this.dataCallback({
                powerBands : this.powerBands,
                metrics : this.metrics
            })
        }, 100) ;
    }

    ComputeMetrics = () => {

        let alpha = 0 ;
        let theta = 0 ;
        let beta = 0 ;
        let gamma = 0 ;

        alpha = ( this.ClampData(this.powerBands.alpha[1] / this.powerBands.total[1]) + this.ClampData(this.powerBands.alpha[3] / this.powerBands.total[3]))  / ( this.ClampData(this.powerBands.delta[0] / this.powerBands.total[0]) + this.ClampData(this.powerBands.delta[2] / this.powerBands.total[2])) ; 
        theta = ( this.ClampData(this.powerBands.theta[1] / this.powerBands.total[1]) + this.ClampData(this.powerBands.theta[3] / this.powerBands.total[3]))  / ( this.ClampData(this.powerBands.alpha[0] / this.powerBands.total[0]) + this.ClampData(this.powerBands.alpha[2] / this.powerBands.total[2])) ; 
        beta = ( this.ClampData(this.powerBands.beta[1] / this.powerBands.total[1]) + this.ClampData(this.powerBands.beta[3] / this.powerBands.total[3]))  / ( this.ClampData(this.powerBands.theta[1] / this.powerBands.total[1]) + this.ClampData(this.powerBands.theta[3] / this.powerBands.total[3])) ; 
        
        alpha = this.ClampData(alpha, .5, 2) - 1 ;
        theta = this.ClampData(theta, .5, 2) - 1 ;
        beta = this.ClampData(beta, .5, 2) - 1 ;
        
        let ralpha = (
            this.ClampData(this.powerBands.alpha[0] / this.powerBands.total[0])
            + this.ClampData(this.powerBands.alpha[1] / this.powerBands.total[1])
            + this.ClampData(this.powerBands.alpha[2] / this.powerBands.total[2])
            + this.ClampData(this.powerBands.alpha[3] / this.powerBands.total[3]) - 4
        ) / 4 ;

        let rgamma = (
                this.ClampData(this.powerBands.gamma[0] / this.powerBands.total[0])
                + this.ClampData(this.powerBands.gamma[1] / this.powerBands.total[1])
                + this.ClampData(this.powerBands.gamma[2] / this.powerBands.total[2])
                + this.ClampData(this.powerBands.gamma[3] / this.powerBands.total[3]) - 4
        ) / 4 ;
             
        if (ralpha > 0 && rgamma > 0)
        {
            gamma = 2 / (1 / ralpha + 1 / rgamma) ;
        }
        console.log('ralpha, rgamma, gamma', ralpha, rgamma, gamma)

        // fill buffers
        let bAlpha = this.buffers.alpha.slice(1) ;
        bAlpha.push(alpha) ;
        let bTheta = this.buffers.theta.slice(1) ;
        bTheta.push(theta) ;
        let bBeta = this.buffers.beta.slice(1) ;
        bBeta.push(beta) ;
        let bGamma = this.buffers.gamma.slice(1) ;
        bGamma.push(gamma) ;

        this.buffers = {
            'alpha' : [...bAlpha],
            'theta' : [...bTheta],
            'beta' : [...bBeta],
            'gamma' : [...bGamma],
        } ;

        let sortedBAlpha = [...bAlpha].sort() ;
        let sortedBTheta = [...bTheta].sort() ;
        let sortedBBeta = [...bBeta].sort() ;
        let sortedBGamma = [...bGamma].sort() ;

        let _min = sortedBAlpha[5] ;
        let _max = sortedBAlpha[54] ;
        let nAlpha = 0 ;
        if (_max > _min)
        {
            nAlpha = this.ClampData((alpha - _min) / (_max - _min), 0, 1) ;
        }

        _min = sortedBTheta[5] ;
        _max = sortedBTheta[54] ;
        let nTheta = 0 ;
        if (_max > _min)
        {
            nTheta = this.ClampData((theta - _min) / (_max - _min), 0, 1) ;
        }

        _min = sortedBBeta[5] ;
        _max = sortedBBeta[54] ;
        let nBeta = 0 ;
        if (_max > _min)
        {
            nBeta = this.ClampData((beta - _min) / (_max - _min), 0, 1) ;
        }

        _min = sortedBGamma[5] ;
        _max = sortedBGamma[54] ;
        let nGamma = 0 ;
        if (_max > _min)
        {
            nGamma = this.ClampData((gamma - _min) / (_max - _min), 0, 1) ;
        }

        let sAlpha = this.smoothingCoefficient * this.metrics.smoothed.alpha + ( 1 - this.smoothingCoefficient) * alpha ;      
        let sTheta = this.smoothingCoefficient * this.metrics.smoothed.theta + ( 1 - this.smoothingCoefficient) * theta ;      
        let sBeta = this.smoothingCoefficient * this.metrics.smoothed.beta + ( 1 - this.smoothingCoefficient) * beta ;      
        let sGamma = this.smoothingCoefficient * this.metrics.smoothed.gamma + ( 1 - this.smoothingCoefficient) * gamma ;      

        this.metrics = {
            raw : {
                'alpha' : alpha,
                'theta' : theta,
                'beta' : beta,
                'gamma' : gamma,
            },
            normalized : {
                'alpha' : nAlpha,
                'theta' : nTheta,
                'beta' : nBeta,
                'gamma' : nGamma,
            },
            smoothed : {
                'alpha' : sAlpha,
                'theta' : sTheta,
                'beta' : sBeta,
                'gamma' : sGamma,
            }
        } 
    }

    UpdateData = () => {
        setInterval(() => {
            Object.keys(this.electrodes).forEach( item => {
                let powerBands = this.electrodes[item].GetPowerBands() ;
                this.powerBands.delta[this.electrodes[item].index] = powerBands.delta ;
                this.powerBands.theta[this.electrodes[item].index] = powerBands.theta ;
                this.powerBands.alpha[this.electrodes[item].index] = powerBands.alpha ;
                this.powerBands.beta[this.electrodes[item].index] = powerBands.beta ;
                this.powerBands.gamma[this.electrodes[item].index] = powerBands.gamma ;
                this.powerBands.total[this.electrodes[item].index] = powerBands.total ;
            })
            this.ComputeMetrics() ;
        }, 20);
    }
  
    connexion = async() => {

        let isConnected = false ;

        navigator.bluetooth.requestDevice( this.museDeviceOptions )
        .then( device => {
            this.currentDevice = device ;
            return device.gatt.connect() ;
        })
        .then( server => {
            isConnected = true ;
            return server.getPrimaryService( this.primaryService ) ;
        })
        .then( service => {
            return Promise.all([
                MuseInfo.characteristics.map ( item => {
                    if (item.type === 'electrode')
                    {
                        
                        service.getCharacteristic( item.uid )
                        .then( char => char.startNotifications())
                        .then ( char => {
                            char.addEventListener(
                                'characteristicvaluechanged',
                                this.electrodes[item.name].handleCharacteristicValueChanged
                            )
                        })
                    }
                    else if (item.type === 'connector')
                    {
                        service.getCharacteristic(item.uid)
                        .then( char => {
                            var buffer = new ArrayBuffer(3) ;
                            var command = new Uint8Array(buffer) ;
                            command.set([0x02, 0x64, 0x0a]) ;
                            char.writeValue(command, 'never') ;
                        })
                    }
                })

            ])
        })
        .then( () => {
            this.statusCallback(true) ;
            this.UpdateData() ;
            this.SendData() ;
        })
        .catch((error) => {
            console.log(error) ;
            this.statusCallback(false) ;
        }) 
    }
}