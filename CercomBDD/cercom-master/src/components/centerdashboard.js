import React, { useState, useEffect } from 'react' ;
import { Box, Typography, IconButton, AppBar, Toolbar, FormControl, FormGroup, FormControlLabel, Switch, InputLabel, MenuItem, Button, Select, } from '@mui/material' ;
import RingChart from "./ringchart" ;
import LineChart from "./linechart" ;
import MatrixChart from "./matrixchart" ;

const CenterDashboard = ( { affinity, bufferAffinity, densityMap, isVisible }) => {

    const sizeBuffer = 200 ;

    const [ lineData, setLineData ] = useState() ;
    const [ matrixData, setMatrixData ] = useState([]) ;

    const [ ringData, setRingData ] = useState(0) ;

    useEffect(() => {

        let _data = [] ;
        for (let i = 0 ; i < sizeBuffer ; i++)
        {
          _data.push({
            index : i,
            value : 0,
          })
        }

        setLineData(_data) ;

        _data = [] ;
 
        for ( let i = 0 ; i < 4 ; i++ )
        {
            for ( let j = 0 ; j < 4 ; j++ )
            {
                _data.push({
                    i : i * 0.25,
                    j : j * 0.25,
                    value01 : 0,
                    value02 : 0,
                })
            }
        }

        setMatrixData(_data) ;
    
    }, [])

    useEffect( () => {
        setRingData(affinity) ;
    }, [ affinity ])

    useEffect(() => {
        if (bufferAffinity !== undefined)
        {
            setLineData(bufferAffinity) ;
        }
    }, [bufferAffinity])

    useEffect( () => {
        if (densityMap !== undefined && densityMap.length > 0)
        {
            let _total = 0 ;
            let _dm = [] ;
            for (var i = 0 ; i < 16 ; i++)
            {
                _total += densityMap[i].value01 ;
            }
            
            if (_total > 0)
            {
                for (var i = 0 ; i < 16 ; i++)
                {
                    _dm.push(
                        {
                            i : densityMap[i].i,
                            j : densityMap[i].j,
                            value01 : densityMap[i].value01,
                            value02 : densityMap[i].value02,
                            total : _total
                        }) ;
                }
                setMatrixData(_dm) ;
            }
        }
        
    }, [ densityMap ])
    if(isVisible){
        return ''
    }
    else{
        return(
            <div className = "CenterDashboard">
            <div id = "RingCenter" className = "CenterChartContainer">
                <RingChart
                    selector = "#RingCenter"
                    label = "Affinity Metric Score"
                    data = { ringData }
                    color = '#530470'
                />
            </div>

            <div id = "LineCenter" className = "CenterChartContainer">
                <LineChart
                    selector = "#LineCenter"
                    label = "Affinity evolution"
                    data = { lineData }  
                    max = { 100 }                                           
                />
            </div>
        </div>
        )
    }
}

export default CenterDashboard ;