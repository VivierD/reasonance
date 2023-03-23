import React, { useState, useEffect } from 'react' ;
import * as d3 from 'd3' ;

const LineChart = ( { selector, data, label, max } ) => {

    const [ sel, setSel ] = useState(undefined) ;
    var xScale = d3.scaleLinear() ;
    var yScale = d3.scaleLinear() ;
    const [ sizes, setSizes ] = useState(undefined) ;

    const [ mySVG, setMySVG ] = useState(undefined) ;

    useEffect( () => {

        setSel(d3.select(selector)) ;

    }, [])

    useEffect( () => {

        if (sel !== undefined)
        {
            const margin = { left : 40, right : 40, top : 40, bottom : 40} ;
            var bbox = sel.node().getBoundingClientRect() ;

            let _sizes = {
                left : margin.left,
                right : margin.right,
                top : margin.top,
                bottom : margin.bottom,
                width : bbox.width - margin.left - margin.right,
                height : bbox.height - margin.top - margin.bottom,
            }
            setSizes(_sizes) ;
            
            xScale = d3.scaleLinear().domain(d3.extent(data.map(d => d.index))).range([_sizes.left, _sizes.width + _sizes.left]) ;
            yScale = d3.scaleLinear().domain([0, max]).range([_sizes.height + _sizes.top, _sizes.top]) ;
    
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

            svg
                .append("g")
                .attr("class", "x_axis")
                .attr("transform", `translate(${0}, ${_sizes.height + _sizes.bottom})`)
                .call(d3.axisBottom(xScale));

            svg
                .append("g")
                .attr("class", "y_axis")
                .attr("transform", `translate(${_sizes.left}, ${0})`)
                .call(d3.axisLeft(yScale)) ;

            const keys = [] ;
            Object.keys(data[0]).map( item => {
                if (!item.includes('index'))
                    keys.push(item) ;
            })

            var myColor = ['blue', 'green', 'orange', 'yellow']

            keys.map( (key, index) => {

                let lineGenerator = d3.line()
                .x(d => xScale(d.index))
                .y(d => yScale(d[key] * 100))
                .curve(d3.curveMonotoneX) ;

                svg.selectAll(null)
                .data([data])
                .join('path')
                .attr('id', 'line_' + selector.substring(1) + "_" + key)
                .attr('stroke', myColor[index])
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .attr('d', lineGenerator) ;

            })

            setMySVG(svg) ;

        }

    }, [sel])


    useEffect( () => {

        if (mySVG !== undefined && data.length > 0)
        {
            xScale = d3.scaleLinear().domain(d3.extent(data.map(d => d.index))).range([sizes.left, sizes.width + sizes.left]) ;
            yScale = d3.scaleLinear().domain([0, max]).range([sizes.height + sizes.top, sizes.top]) ;

            const keys = [] ;
            Object.keys(data[0]).map( item => {
                if (!item.includes('index'))
                    keys.push(item) ;
            })

           
            var myColor = ['blue', 'green', 'orange', 'yellow']

            keys.map( (key, index) => {

                let lineGenerator = d3.line()
                .x(d => xScale(d.index))
                .y(d => yScale(d[key] * 100))
                .curve(d3.curveMonotoneX) ;

                let line = d3.select('#line_' + selector.substring(1) + "_" + key) ;

                line
                .data([data])
                .join('path')
                .transition()
                .duration(100)
                .attr('stroke', myColor[index])
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .attr('d', lineGenerator) ;
            })    
        }
        
    }, [data])

    return (
        <div></div>

    )
}

export default LineChart ;