import React, { useState, useEffect } from 'react' ;

import SpiderChart from "./spiderchart" ;
import RingChart from "./ringchart" ;
import BarChart from "./barchart" ;
import LineChart from "./linechart" ;

const LeftDashboard = ( { PSD, metric, metrics, metricsBuffer, isVisible, isAvancee } ) => {

    const sizeBuffer = 200 ;

    const [ lineData, setLineData ] = useState([]) ;

    const [ ringData, setRingData ] = useState(Math.random()) ;

    const [ barmetrics, setBarmetrics ] = useState() ;

    const [ PowerBands, setPowerBands ] = useState([
        {
            metric : 'delta',
            value : 0
        },
        {
            metric : 'theta',
            value : 0
        },
        {
            metric : 'alpha',
            value : 0
        },
        {
            metric : 'beta',
            value : 0
        },
        {
            metric : 'gamma',
            value : 0
        },
    ]) ;


    useEffect( () => {
        setRingData(metric) ;
    }, [ metric ])

    useEffect( () => {
        
        if (metrics !== undefined)
        {
            let _barmetrics = [] ;
            let _metrics = ['α', 'β', 'Θ', 'Γ']
            _barmetrics.push({
                index : _metrics[0],
                value : metrics.alpha,
            })
            _barmetrics.push({
                index : _metrics[1],
                value : metrics.beta,
            })
            _barmetrics.push({
                index : _metrics[2],
                value : metrics.theta,
            })
            _barmetrics.push({
                index : _metrics[3],
                value : metrics.gamma,
            })
            setBarmetrics(_barmetrics) ;
        }
    }, [ metrics ])

    useEffect(() => {

        let _data = [] ;
        for (let i = 0 ; i < sizeBuffer ; i++)
        {
          _data.push({
            index : i,
            alpha : 0,
            beta : 0,
            theta : 0,
            gamma : 0,
          })
        }
    
        setLineData(_data) ;

        let _barmetrics = [] ;
        let _metrics = ['α', 'β', 'Θ', 'Γ']
        for (let i = 0 ; i < 4 ; i++)
        {
        _barmetrics.push({
            index : _metrics[i],
            value : 0,
        })
        }
        setBarmetrics(_barmetrics) ;
    
    }, [])

    useEffect(() => {

        let delta = PSD.delta[0] + PSD.delta[1] + PSD.delta[2] + PSD.delta[3] ; 
        let theta = PSD.theta[0] + PSD.theta[1] + PSD.theta[2] + PSD.theta[3] ; 
        let alpha = PSD.alpha[0] + PSD.alpha[1] + PSD.alpha[2] + PSD.alpha[3] ; 
        let beta = PSD.beta[0] + PSD.beta[1] + PSD.beta[2] + PSD.beta[3] ; 
        let gamma = PSD.gamma[0] + PSD.gamma[1] + PSD.gamma[2] + PSD.gamma[3] ;
        let total = PSD.total[0] + PSD.total[1] + PSD.total[2] + PSD.total[3] ;
        
        if (total > 0)
        {
            delta /= total ;
            theta /= total ;
            alpha /= total ;
            beta /= total ;
            gamma /= total ;
        }
        else
        {
            delta = 0 ;
            theta = 0 ;
            alpha = 0 ;
            beta = 0 ;
            gamma = 0 ;
        }

        setPowerBands([
            {
                metric : 'δ',
                value : delta
            },
            {
                metric : 'Θ',
                value : theta
            },
            {
                metric : 'α',
                value : alpha
            },
            {
                metric : 'β',
                value : beta
            },
            {
                metric : 'Γ',
                value : gamma
            }]
        )

    }, [ PSD ])

    useEffect( () => {

        if (metricsBuffer !== undefined)
        {
            setLineData(metricsBuffer) ;
        }
    }, [ metricsBuffer ])
    
    if (isVisible)
    {
        return ''
    }
    else{
    
    return (
        <div className = "LeftDashboard">

            <div id = "SpiderLeft" className = "SideChartContainer">
                <SpiderChart
                    selector = "#SpiderLeft"
                    label = "Power Spectrum Density"
                    data = { PowerBands }
                    color = "#173978"
                />
            </div>

            <div id = "RingLeft" className = "SideChartContainer">
                <RingChart
                    selector = "#RingLeft"
                    label = "Metric Score"
                    data = { ringData }
                    color = "#173978"
                />
            </div>

            <div id = "BarLeft" className = "SideChartContainer">
                <BarChart
                    selector = "#BarLeft"
                    label = "Metrics State"
                    data = { barmetrics }
                    color = "#173978"
                />
            </div>

            <div id = "LineLeft" className = "SideChartContainer">
                <LineChart
                    selector = "#LineLeft"
                    label = "Metrics evolution"
                    data = { lineData }
                    max = { 100 }
                />
            </div>

        </div>
    )
    }
}

export default LeftDashboard ;