import React, { useState, useEffect } from 'react' ;
import * as d3 from 'd3' ;

const SpiderChart = ({ selector, data, label, color }) => {

    var xScale = d3.scaleBand()
    var yScale = d3.scaleBand()
    
    const [ sel, setSel ] = useState(undefined) ;
    const [ sizes, setSizes ] = useState(undefined) ;
    const [ mySVG, setMySVG ] = useState(undefined) ;
    const [ mLength, setMLength ] = useState(0) ;

    const [ radar, setRadar ] = useState(undefined) ;

    useEffect( () => {

        setSel(d3.select(selector)) ;

    }, [])

    useEffect( () => {

        if (sel !== undefined)
        {
            const minMargin = 20 ;
            let margin = { top : minMargin, bottom : minMargin, left : minMargin, right : minMargin}

            var bbox = sel.node().getBoundingClientRect() ;

            let minLength = 0 ;

            if (bbox.width > bbox.height)
            {
                minLength = bbox.height - minMargin * 2 ;
                margin.left = ( bbox.width - minLength ) / 2 ;
                margin.right = ( bbox.width - minLength ) / 2 ;
            }
            else
            {
                minLength = bbox.width - minMargin * 2 ;
                margin.top = (bbox.height - minLength) / 2 ;
                margin.bottom = (bbox.height - minLength) / 2 ;
            }

            let _sizes = {
                left : margin.left,
                right : margin.right,
                top : margin.top,
                bottom : margin.bottom,
                width : bbox.width - margin.left - margin.right,
                height : bbox.height - margin.top - margin.bottom,
            }

            setSizes(_sizes) ; 
            setMLength(minLength) ;         

            let svg = sel
                .append("svg")
                .attr("width", _sizes.width + _sizes.left + _sizes.right)
                .attr("height", _sizes.height + _sizes.top + _sizes.bottom)
                .append("g")

            svg.append("text")
                .attr("x", (bbox.width / 2))             
                .attr("y", _sizes.top/2)
                .attr("text-anchor", "middle")  
                .style("font-size", "12px")
                .style('stroke', '#3b3b3b') 
                .style('fill', '#3b3b3b') 
                .text(label) ;

            let radialScale = d3.scaleLinear()
                .domain( [ 0, 0.40 ] )
                .range( [ 25, minLength/2 ] ) ;                

            let ticks = [ 0.1, .2, .3, .4 ] ;

            ticks.forEach(t =>
                svg.append("text")
                .attr("x", bbox.width/2)
                .attr("y", bbox.height/2 - radialScale(t) + 25)
                .text(t.toString())
                .attr('text-anchor', 'middle')
                .attr('font-size', 6)
                .attr('stroke', '#3b3b3b')
        
            ) ;

            const angleToCoordinate = (angle, value) => {
                let x = Math.cos(angle) * radialScale(value) ;
                let y = Math.sin(angle) * radialScale(value) ;
                return { "x": bbox.width/2 + x, "y": bbox.height/2 - y + 10 } ;
            }
        
            data.forEach( ( item, index ) => {
        
                let angle = (Math.PI / 2) + (2 * Math.PI * index / data.length ) ;
                let line_coordinate = angleToCoordinate( angle, 0.4 ) ;
                let label_coordinate = angleToCoordinate( angle, 0.45 ) ;
        
                svg.append("line")
                    .attr("x1", bbox.width/2)
                    .attr("y1", bbox.height/2 + 20)
                    .attr("x2", line_coordinate.x)
                    .attr("y2", line_coordinate.y + 10)
                    .attr("stroke","#3b3b3b") ;
        
                svg.append("text")
                    .attr("x", label_coordinate.x)
                    .attr("y", label_coordinate.y + 10)
                    .text(item.metric)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', 8)
                    .attr('stroke', '#3b3b3b') ;
            })
        
            let line = d3.line()
            .x(d => d.x)
            .y(d => d.y + 10) ;
            
            const getPathCoordinates = data_point => {
        
                let coordinates = [] ;
        
                data_point.forEach ( (item, index) => {
                    //let ft_name = data[index].metric ;
                    let angle = (Math.PI / 2) + (2 * Math.PI * index / data_point.length) ;
                    coordinates.push(angleToCoordinate(angle, item.value)) ;
                })
                coordinates.push(coordinates[0]) ;
                return coordinates ;
            }
        
            ticks.map ( (tickValue, index) => {
                const tickData = []
                data.map( item => {
                    tickData.push({
                        metric : item.metric,
                        value : tickValue,
                    }) ;
                })
                let tickCoordinates = getPathCoordinates(tickData) ;
            
                svg.append("path")
                    .datum(tickCoordinates)
                    .attr("d", line)
                    .attr("stroke-width", 1)
                    .attr("stroke", '#3b3b3b')
                    .attr("fill", 'none')    
            })

            svg.selectAll(null)
                .data(data)
                .enter()
                .append('circle')
                .attr('r', 15)
                .attr('cx', (d, index) => {
                    let angle = (Math.PI / 2) + (2 * Math.PI * index / data.length) ;
                    return angleToCoordinate(angle, d.value).x ;
                })
                .attr('cy', (d, index) => {
                    let angle = (Math.PI / 2) + (2 * Math.PI * index / data.length) ;
                    return angleToCoordinate(angle, d.value).y ;
                })
                .attr('fill', 'transparent')
                .attr('stroke', 'transparent')

            let coordinates = getPathCoordinates(data) ;
            let _radar = svg.append("path")
                .datum(coordinates)
                .attr("d", line)
                .attr("stroke-width", 2)
                .attr("stroke", color)
                .attr("stroke-opacity", .8)
                .attr("fill", color)
                .attr("fill-opacity", 0.6)

            setRadar(_radar) ;

            setMySVG(svg) ;
        }

    }, [sel])


    useEffect( () => {

        if (mySVG !== undefined && radar !== undefined && data.length > 0 && mLength > 0)
        {
            var bbox = sel.node().getBoundingClientRect() ;
            let line = d3.line()
            .x(d => d.x)
            .y(d => d.y + 10) ;

            let radialScale = d3.scaleLinear()
                .domain( [ 0, 0.40 ] )
                .range( [ 25, mLength/2 ] ) ; 

            const angleToCoordinate = (angle, value) => {
                let x = Math.cos(angle) * radialScale(value) ;
                let y = Math.sin(angle) * radialScale(value) ;
                return { "x": bbox.width/2 + x, "y": bbox.height/2 - y + 10 } ;
            }

            const getPathCoordinates = data_point => {
        
                let coordinates = [] ;
        
                data_point.forEach ( (item, index) => {
                    //let ft_name = data[index].metric ;
                    let angle = (Math.PI / 2) + (2 * Math.PI * index / data_point.length) ;
                    coordinates.push(angleToCoordinate(angle, item.value)) ;
                })
                coordinates.push(coordinates[0]) ;
                return coordinates ;
            }

            let coordinates = getPathCoordinates(data) ;
            radar
                .datum(coordinates)
                .transition()
                .duration(100)
                .attr("d", line)
                .attr("stroke-width", 2)
                .attr("stroke", color)
                .attr("stroke-opacity", .8)
                .attr("fill", color)
                .attr("fill-opacity", 0.6)
        }

    }, [data])

    return (
        <></>
    )
}

export default SpiderChart ;