import './App.css' ;
import {Box} from '@mui/material';

import React, { useState, useEffect } from 'react' ;
import AnimationScreen from './components/animationscreen' ;
import LeftDashboard from './components/leftdashboard' ;
import CenterDashboard from './components/centerdashboard' ;
import RightDashboard from './components/rightdashboard' ;
import BottomMenu from './components/bottommenu' ;

import Player00 from './assets/sprites/littleBuddhaBlue.png' ;
import Player01 from './assets/sprites/littleBuddhaPink.png' ;
import PlayerFoot0 from './assets/sprites/Fooot1-V0.png'
import PlayerFoot1 from './assets/sprites/Fooot-V1.png'
import Plongeur0 from './assets/sprites/plongeur.png'
import Plongeur1 from './assets/sprites/plongeur1.png'
import fleche from './assets/sprites/fleche.png'
import fleche1 from './assets/sprites/fleche 1.png'

import useWindowDimensions from './functions/useWindowDimensions' ;

import useSound from 'use-sound' ;
import BackgroundMusic from './assets/sounds/background.mp3' ;

const App = () => {

  const sizeBuffer = 200 ;

  const { height, width } = useWindowDimensions() ;

  const [ leftData, setLeftData ] = useState(undefined) ;
  const [ rightData, setRightData ] = useState(undefined) ;
  
  const [ streaming, setStreaming ] = useState(false) ;
  const [ choosenMetric, setChoosenMetric ] = useState('None') ;

  const [ leftMetric, setLeftMetric ] = useState(0) ;
  const [ rightMetric, setRightMetric ] = useState(0) ; 

  const [ leftPSD, setLeftPSD ] = useState({delta : [0, 0, 0, 0], theta : [0, 0, 0, 0], alpha : [0, 0, 0, 0], beta : [0, 0, 0, 0], gamma : [0, 0, 0, 0], total : [0, 0, 0, 0] }) ;
  const [ rightPSD, setRightPSD ] = useState({delta : [0, 0, 0, 0], theta : [0, 0, 0, 0], alpha : [0, 0, 0, 0], beta : [0, 0, 0, 0], gamma : [0, 0, 0, 0], total : [0, 0, 0, 0] }) ; 

  const [ leftMetrics, setLeftMetrics ] = useState({alpha : 0, beta : 0, theta : 0, gamma : 0 }) ;
  const [ rightMetrics, setRightMetrics ] = useState({alpha : 0, beta : 0, theta : 0, gamma : 0 }) ;

  const [ bufferLeftMetrics, setBufferLeftMetrics ] = useState(undefined) ;
  const [ bufferRightMetrics, setBufferRightMetrics ] = useState(undefined) ;

  const [ proximity, setProximity ] = useState(0) ;
  const [ bufferProximity, setBufferProximity ] = useState(undefined) ;

  const [ densityMap, setDensityMap ] = useState(undefined) ;

  const lambda = 0.9 ;

  const [playBackground, { stop }] = useSound(
    BackgroundMusic,
    { volume: 1 }
  ) ;

  useEffect( () => {
    if (streaming)
      playBackground() ;
    else
      stop() ;
  }, [ streaming ])

  useEffect( () => {

    var _blm = [] ;
    var _brm = [] ;
    var _bp = [] ;
    for (var i = 0 ; i < sizeBuffer ; i++)
    {
      _blm.push({index : i, alpha : 0, beta : 0, theta : 0, gamma : 0, }) ;
      _brm.push({index : i, alpha : 0, beta : 0, theta : 0, gamma : 0, }) ;
      _bp.push({index : i, value : 0}) ;
    }
    setBufferLeftMetrics([..._blm]) ;
    setBufferRightMetrics([..._brm]) ;
    setBufferProximity([..._bp]) ;

    var _dm = [] ;
    for (var i = 0 ; i < 4 ; i++)
    {
      for (var j = 0 ; j < 4 ; j++)
      {
        _dm.push({
          i : i * .25,
          j : j * .25,
          value01 : 0,
          value02 : 0,
        })
      }
    }
    setDensityMap([..._dm]) ;

  }, [])

  useEffect( () => {

    if (streaming && choosenMetric !== 'None' && leftData !== undefined && rightData !== undefined)
    {
      //console.log(leftData, rightData) ;
      let _ld = leftData ;
      let _rd = rightData ;

      let _lpsd = {
        delta : _ld.powerBands.delta, 
        theta : _ld.powerBands.theta,
        alpha : _ld.powerBands.alpha,
        beta : _ld.powerBands.beta,
        gamma : _ld.powerBands.gamma,
        total : _ld.powerBands.total,
      }

      let _rpsd = {
        delta : _rd.powerBands.delta, 
        theta : _rd.powerBands.theta,
        alpha : _rd.powerBands.alpha,
        beta : _rd.powerBands.beta,
        gamma : _rd.powerBands.gamma,
        total : _rd.powerBands.total,
      }

      setLeftPSD(_lpsd) ;
      setRightPSD(_rpsd) ;

      setLeftMetrics({
        alpha : _ld.metrics.smoothed.alpha, 
        beta : _ld.metrics.smoothed.beta, 
        theta : _ld.metrics.smoothed.theta,
        gamma : _ld.metrics.smoothed.gamma,
      }) ;

      setRightMetrics({
        alpha : _rd.metrics.smoothed.alpha, 
        beta : _rd.metrics.smoothed.beta, 
        theta : _rd.metrics.smoothed.theta,
        gamma : _rd.metrics.smoothed.gamma,
      }) ;

      let _blm = [] ;
      let _brm = [] ;
      for (var i = 0 ; i < sizeBuffer - 1 ; i++)
      {
        _blm.push(
          {
            index : i,
            alpha : bufferLeftMetrics[i+1].alpha,
            beta : bufferLeftMetrics[i+1].beta,
            theta : bufferLeftMetrics[i+1].theta,
            gamma : bufferLeftMetrics[i+1].gamma,
          }
        )
        _brm.push(
          {
            index : i,
            alpha : bufferRightMetrics[i+1].alpha,
            beta : bufferRightMetrics[i+1].beta,
            theta : bufferRightMetrics[i+1].theta,
            gamma : bufferRightMetrics[i+1].gamma,
          }
        )
      }
      _blm.push(
        {
          index : sizeBuffer - 1,
          alpha : _ld.metrics.smoothed.alpha,
          beta : _ld.metrics.smoothed.beta, 
          theta : _ld.metrics.smoothed.theta, 
          gamma : _ld.metrics.smoothed.gamma,
        }
      ) ;

      _brm.push(
        {
          index : sizeBuffer - 1,
          alpha : _rd.metrics.smoothed.alpha,
          beta : _rd.metrics.smoothed.beta, 
          theta : _rd.metrics.smoothed.theta, 
          gamma : _rd.metrics.smoothed.gamma,
        }
      ) ;

      setBufferLeftMetrics([..._blm]) ;
      setBufferRightMetrics([..._brm]) ;

      let _lm = 0 ;
      let _rm = 0 ;
      if (choosenMetric.includes('Calm'))
      {
        setLeftMetric(_ld.metrics.smoothed.alpha)
        setRightMetric(_rd.metrics.smoothed.alpha)
      }
      else if (choosenMetric.includes('Focus'))
      {
        setLeftMetric(_ld.metrics.smoothed.beta)
        setRightMetric(_rd.metrics.smoothed.beta)
      }
      else if (choosenMetric.includes('Deep'))
      {
        setLeftMetric(_ld.metrics.smoothed.theta)
        setRightMetric(_rd.metrics.smoothed.theta)
      }
      else if (choosenMetric.includes('Flow'))
      {
        setLeftMetric(_ld.metrics.smoothed.gamma)
        setRightMetric(_rd.metrics.smoothed.gamma)
      }
    }

  }, [ leftData, rightData ])


  useEffect( () => {

    if (leftMetric > 0 && rightMetric > 0)
    {
      setProximity(old => lambda * old + (1 - lambda) * (1 - Math.abs(leftMetric, rightMetric))) ;
      var _dm = [] ;
      for (var i = 0 ; i < 4 ; i++)
      {
        for (var j = 0 ; j < 4 ; j++)
        {
          let value = densityMap.filter(item => item.i === i*0.25 && item.j === j*0.25)[0] ;
          if ( (leftMetric !== 0 || rightMetric !== 0) && leftMetric >= i*0.25 && leftMetric < (i+1)*0.25 && rightMetric >= j*0.25 && rightMetric < (j+1)*0.25)
          {
            _dm.push({
              i : i * .25,
              j : j * .25,
              value01 : value.value01 + 1,
              value02 : value.value02 + 1,
            })
          }
          else
          {
            _dm.push({
              i : i * .25,
              j : j * .25,
              value01 : value.value01,
              value02 : value.value02,
            })
          }

        }
      }
      setDensityMap(_dm) ;
    }
  }, [ leftMetric, rightMetric ])

  useEffect( () => {
    //console.log(densityMap)
  }, [densityMap])

  useEffect( () => {
    //console.log('Proximity :', proximity) ;
    if (bufferProximity !== undefined)
    {
      let _bprox = [] ;
      for (var i = 0 ; i < sizeBuffer - 1 ; i++)
      {
          _bprox.push(
            {
              index : i,
              value : bufferProximity[i+1].value
            }
          )
      }
      _bprox.push({ index : sizeBuffer - 1, value : proximity })
      setBufferProximity([..._bprox]) ;
    }
  }, [ proximity ])

  const [ isVisible, setIsVisible] = useState(true)
  const handleIsVisible = ( e ) => {
      setIsVisible(ancien => !ancien) ;
  }

  const defaultIndividualMetrics = [
    { id : 0, name : 'Calme', title : 'Mode portée sur la relaxation, utilisant les ondes Alpha / Delta. En évidence lorsque les yeux sont fermés.' },
    { id : 1, name : 'Concentration', title : 'Mode portée sur la concentration et la réflexion cérébrale, utilisant les ondes Beta / Theta. Lors de calculs mentaux par exemple.' },
    { id : 2, name : 'Deep', title : 'Mode portée sur la créativité, l inspiration et le subconscient, utilisant les ondes Theta / Alpha. Très hautes lors d etat de relaxation voir d hypnose' },
    { id : 3, name : 'Flow', title : 'Mode portée sur la haute activité mentale, la perception, l intuition utilisant les ondes Alpha, Gamma. Très utilisé lors de sports collectifs et lorsqu on parle de vision de jeu.' },
]

const [ selectedIndividualMetric, setSelectedIndividualMetric ] = useState('None') ;
const [ individualMetrics, setIndividualMetrics ] = useState(defaultIndividualMetrics) ;
const handleSelectedIndividualMetricChange = ( event ) => {
    setSelectedIndividualMetric(event.target.value) ;
    console.log(selectedIndividualMetric)
}


firebase.initializeApp(firebaseConfig) ;
firebase.firestore() ;

const rrfConfig = {
userProfile: "Users",
useFirestoreForProfile: true,
} ;

const initialState = {} ;
const store = createStore(rootReducer, initialState) ;

const rrfProps = {
firebase,
config: rrfConfig,
dispatch: store.dispatch,
createFirestoreInstance,
};





if(selectedIndividualMetric === 'Flow'){
  return (
    <div className = "AppContainerFlow">
      <div className = "BodyContainer">
      <LeftDashboard

          isVisible = {isVisible}
          metric = { leftMetric }
          PSD = { leftPSD }        
          metricsBuffer = { bufferLeftMetrics }
          metrics = { leftMetrics }
        />
        <div className = "CenterPanel">
          <AnimationScreen />
          <CenterDashboard
 
            isVisible = {isVisible}          
            affinity = { proximity }
            bufferAffinity = { bufferProximity }
            densityMap = { densityMap }
          />
        </div>
        <RightDashboard

          isVisible = {isVisible}
          metric = { rightMetric }
          PSD = { rightPSD }        
          metricsBuffer = { bufferRightMetrics }
          metrics = { rightMetrics }        
        />
      </div>
      <BottomMenu
      defaultIndividualMetrics = {defaultIndividualMetrics}
      selectedIndividualMetric = {selectedIndividualMetric}
      individualMetrics = {individualMetrics}
      handleSelectedIndividualMetricChange = {(eve) => handleSelectedIndividualMetricChange(eve)}

        isVisible = {isVisible}
        handleIsVisible = {(e) => handleIsVisible(e)}
        hidden = { false }
        onLeftDataChange = { data => setLeftData(data)}
        onRightDataChange = { data => setRightData(data)}
        onMetricChange = { metric => setChoosenMetric(metric)}
        onGamePlayChange = { status => setStreaming(status)}
      />

      <img
        id = 'gamePlayer00'
        style = { { left : (width * .5 - width * .27 * (1 - proximity) - 48).toFixed(0) + 'px', top : (( 1 - leftMetric) * height * 0.6).toFixed(0) + 'px' } }
        src = { PlayerFoot0 }
        width = '96px'
        height = '96px'
      />

      <img
        id = 'gamePlayer01'
        style = { { left : (width * .5 + width * .27 * (1 - proximity) - 48).toFixed(0) + 'px', top : (( 1 - rightMetric) * height * 0.6).toFixed(0) + 'px' } }
        src = { PlayerFoot1 }
        width = '96px'
        height = '96px'
      />
    </div>
  ) ;
}
if(selectedIndividualMetric === 'Deep'){
  return (
    <div className = "AppContainerDeep">
      <div className = "BodyContainer">
      <LeftDashboard
          isVisible = {isVisible}
          metric = { leftMetric }
          PSD = { leftPSD }        
          metricsBuffer = { bufferLeftMetrics }
          metrics = { leftMetrics }
        />
        <div className = "CenterPanel">
          <AnimationScreen />
          <CenterDashboard
            isVisible = {isVisible}          
            affinity = { proximity }
            bufferAffinity = { bufferProximity }
            densityMap = { densityMap }
          />
        </div>
        <RightDashboard
          isVisible = {isVisible}
          metric = { rightMetric }
          PSD = { rightPSD }        
          metricsBuffer = { bufferRightMetrics }
          metrics = { rightMetrics }        
        />
      </div>
      <BottomMenu
      defaultIndividualMetrics = {defaultIndividualMetrics}
      selectedIndividualMetric = {selectedIndividualMetric}
      individualMetrics = {individualMetrics}
      handleSelectedIndividualMetricChange = {(eve) => handleSelectedIndividualMetricChange(eve)}
        isVisible = {isVisible}
        handleIsVisible = {(e) => handleIsVisible(e)}
        hidden = { false }
        onLeftDataChange = { data => setLeftData(data)}
        onRightDataChange = { data => setRightData(data)}
        onMetricChange = { metric => setChoosenMetric(metric)}
        onGamePlayChange = { status => setStreaming(status)}
      />

      <img
        id = 'gamePlayer00'
        style = { { left : (width * .5 - width * .27 * (1 - proximity) - 48).toFixed(0) + 'px', top : (( 1 - leftMetric) * height * 0.6).toFixed(0) + 'px' } }
        src = { Plongeur1 }
        width = '96px'
        height = '96px'
      />

      <img
        id = 'gamePlayer01'
        style = { { left : (width * .5 + width * .27 * (1 - proximity) - 48).toFixed(0) + 'px', top : (( 1 - rightMetric) * height * 0.6).toFixed(0) + 'px' } }
        src = { Plongeur0 }
        width = '96px'
        height = '96px'
      />
    </div>
  ) ;
}
if(selectedIndividualMetric === 'Calme'){
  return (
    <div className = "AppContainer">
      <div className = "BodyContainer">
      <LeftDashboard
          isVisible = {isVisible}
          metric = { leftMetric }
          PSD = { leftPSD }        
          metricsBuffer = { bufferLeftMetrics }
          metrics = { leftMetrics }
        />
        <div className = "CenterPanel">
          <AnimationScreen />
          <CenterDashboard
            isVisible = {isVisible}          
            affinity = { proximity }
            bufferAffinity = { bufferProximity }
            densityMap = { densityMap }
          />
        </div>
        <RightDashboard
          isVisible = {isVisible}
          metric = { rightMetric }
          PSD = { rightPSD }        
          metricsBuffer = { bufferRightMetrics }
          metrics = { rightMetrics }        
        />
      </div>
      <BottomMenu
      defaultIndividualMetrics = {defaultIndividualMetrics}
      selectedIndividualMetric = {selectedIndividualMetric}
      individualMetrics = {individualMetrics}
      handleSelectedIndividualMetricChange = {(eve) => handleSelectedIndividualMetricChange(eve)}

        isVisible = {isVisible}
        handleIsVisible = {(e) => handleIsVisible(e)}
        hidden = { false }
        onLeftDataChange = { data => setLeftData(data)}
        onRightDataChange = { data => setRightData(data)}
        onMetricChange = { metric => setChoosenMetric(metric)}
        onGamePlayChange = { status => setStreaming(status)}
      />

      <img
        id = 'gamePlayer00'
        style = { { left : (width * .5 - width * .27 * (1 - proximity) - 48).toFixed(0) + 'px', top : (( 1 - leftMetric) * height * 0.6).toFixed(0) + 'px' } }
        src = { Player00 }
        width = '96px'
        height = '96px'
      />

      <img
        id = 'gamePlayer01'
        style = { { left : (width * .5 + width * .27 * (1 - proximity) - 48).toFixed(0) + 'px', top : (( 1 - rightMetric) * height * 0.6).toFixed(0) + 'px' } }
        src = { Player01 }
        width = '96px'
        height = '96px'
      />
    </div>
  ) ;
}
if(selectedIndividualMetric === 'Concentration'){
  return (
    <div className = "AppContainerConcentration">
      <div className = "BodyContainer">
      <LeftDashboard
          isVisible = {isVisible}
          metric = { leftMetric }
          PSD = { leftPSD }        
          metricsBuffer = { bufferLeftMetrics }
          metrics = { leftMetrics }
        />
        <div className = "CenterPanel">
          <AnimationScreen />
          <CenterDashboard
            isVisible = {isVisible}          
            affinity = { proximity }
            bufferAffinity = { bufferProximity }
            densityMap = { densityMap }
          />
        </div>
        <RightDashboard
          isVisible = {isVisible}
          metric = { rightMetric }
          PSD = { rightPSD }        
          metricsBuffer = { bufferRightMetrics }
          metrics = { rightMetrics }        
        />
      </div>
      <BottomMenu
      defaultIndividualMetrics = {defaultIndividualMetrics}
      selectedIndividualMetric = {selectedIndividualMetric}
      individualMetrics = {individualMetrics}
      handleSelectedIndividualMetricChange = {(eve) => handleSelectedIndividualMetricChange(eve)}

        isVisible = {isVisible}
        handleIsVisible = {(e) => handleIsVisible(e)}
        hidden = { false }
        onLeftDataChange = { data => setLeftData(data)}
        onRightDataChange = { data => setRightData(data)}
        onMetricChange = { metric => setChoosenMetric(metric)}
        onGamePlayChange = { status => setStreaming(status)}
      />

      <img
        id = 'gamePlayer00'
        style = { { left : (width * .5 - width * .27 * (1 - proximity) - 48).toFixed(0) + 'px', top : (( 1 - leftMetric) * height * 0.6).toFixed(0) + 'px' } }
        src = { fleche }
        width = '96px'
        height = '96px'
      />

      <img
        id = 'gamePlayer01'
        style = { { left : (width * .5 + width * .27 * (1 - proximity) - 48).toFixed(0) + 'px', top : (( 1 - rightMetric) * height * 0.6).toFixed(0) + 'px' } }
        src = { fleche1 }
        width = '96px'
        height = '96px'
      />
    </div>
  ) ;
}
else{
  return (
    <div className = "AppContainer">
      <BottomMenu
      defaultIndividualMetrics = {defaultIndividualMetrics}
      selectedIndividualMetric = {selectedIndividualMetric}
      individualMetrics = {individualMetrics}
      handleSelectedIndividualMetricChange = {(eve) => handleSelectedIndividualMetricChange(eve)}

        isVisible = {isVisible}
        handleIsVisible = {(e) => handleIsVisible(e)}
        hidden = { false }
        onLeftDataChange = { data => setLeftData(data)}
        onRightDataChange = { data => setRightData(data)}
        onMetricChange = { metric => setChoosenMetric(metric)}
        onGamePlayChange = { status => setStreaming(status)}
      />

    </div>
  ) ;
  }
}

export default App ;
