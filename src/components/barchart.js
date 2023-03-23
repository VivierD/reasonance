import React, { useState, useEffect } from 'react' ;
import * as d3 from 'd3' ;

const BarChart = ( { selector, data, label, color } ) => {

    var xScale = d3.scaleBand()
    var yScale = d3.scaleLinear()
    
    const [ sel, setSel ] = useState(undefined) ;
    const [ sizes, setSizes ] = useState(undefined) ;
    const [ mySVG, setMySVG ] = useState(undefined) ;

    useEffect( () => {

        setSel(d3.select(selector)) ;

    }, [])

    useEffect( () => {

        if (sel !== undefined)
        {
            const margin = { left : 25, right : 10, top : 40, bottom : 25} ;
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

            xScale = d3.scaleBand().domain(data.map(d => d.index)).range([_sizes.left, _sizes.width + _sizes.left]).padding(.3) ;
            yScale = d3.scaleLinear().domain([0, 100]).range([_sizes.height + _sizes.top, _sizes.top]) ;
    
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
                .attr("transform", `translate(${0}, ${_sizes.height + _sizes.top})`)
                .call(d3.axisBottom(xScale));

            svg
                .append("g")
                .attr("class", "y_axis")
                .attr("transform", `translate(${_sizes.left}, ${0})`)
                .call(d3.axisLeft(yScale)) ;
            
            svg.selectAll()
                .data(data)
                .enter()
                .append('rect')
                .attr('x', d => xScale(d.index))
                .attr('y', d => yScale(5))
                .attr('height', d => _sizes.height + _sizes.top - yScale(5))
                .attr('width', xScale.bandwidth())
                .style('fill', color)
                
            svg.selectAll('.bar_' + selector.substring(1))
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'bar_' + selector.substring(1))
                .attr('rx', 5)
                .attr('ry', 5)
                .attr('x', d => xScale(d.index))
                .attr('y', d => yScale(d.value * 100))
                .attr('height', d => _sizes.height + _sizes.top - yScale(d.value*100))
                .attr('width', xScale.bandwidth())
                .style('fill', color)

            setMySVG(svg) ;

        }

    }, [sel])


    useEffect( () => {

        if (mySVG !== undefined && data.length > 0)
        {
            xScale = d3.scaleBand().domain(data.map(d => d.index)).range([sizes.left, sizes.width + sizes.left]).padding(.3) ;
            yScale = d3.scaleLinear().domain([0, 100]).range([sizes.height + sizes.top, sizes.top]) ;

            if (sizes !== undefined)
            {
                mySVG.selectAll('.bar_' + selector.substring(1))
                .data(data)
                .transition()
                .duration(100)
                .attr('x', d => xScale(d.index))
                .attr('y', d => yScale(d.value * 100))
                .attr('height', d => sizes.height + sizes.top - yScale(d.value*100))
                .attr('width', xScale.bandwidth())
            }
        }

    }, [data])

    return (
        <></>
    )

}

export default BarChart ;