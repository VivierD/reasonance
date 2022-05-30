import React, { useState, useEffect } from 'react' ;
import * as d3 from 'd3' ;

const MatrixChart = ( { selector, data, label } ) => {

    var xScale = d3.scaleBand()
    var yScale = d3.scaleBand()
    
    const [ sel, setSel ] = useState(undefined) ;
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

            xScale = d3.scaleBand().domain(data.map(d => d.i)).range([_sizes.left, _sizes.width + _sizes.left]).padding(.05) ;
            yScale = d3.scaleBand().domain(data.map(d => d.j)).range([_sizes.top, _sizes.height + _sizes.top].reverse()).padding(.05) ;
    
            var colors = d3.scaleLinear()
                .domain([0, 1])
                .range(["#ffffff", "rgba(198, 45, 205, 0.8)"])

            let svg = sel
                .append("svg")
                .attr("width", _sizes.width + _sizes.left + _sizes.right)
                .attr("height", _sizes.height + _sizes.top + _sizes.bottom)
                .append("g")

            svg.append("text")
                .attr("x", bbox.width / 2)             
                .attr("y", _sizes.top/2)
                .attr("text-anchor", "middle")  
                .style("font-size", "12px")
                .style('stroke', '#3b3b3b') 
                .style('fill', '#3b3b3b') 
                .text(label) ;

            svg.append("g")
                .attr("class", "x_axis")
                .attr("transform", `translate(${0}, ${_sizes.height + _sizes.bottom})`)
                .call(d3.axisBottom().scale(xScale).ticks(1));

            svg.append("g")
                .attr("class", "y_axis")
                .attr("transform", `translate(${_sizes.left}, ${0})`)
                .call(d3.axisLeft().scale(yScale).ticks(1)) ;

            svg.selectAll('.rect')
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'rect')
                .attr('x', d => xScale(d.i))
                .attr('y', d => yScale(d.j))
                .attr('width', xScale.bandwidth())
                .attr('height', yScale.bandwidth())
                .attr('fill', d => colors(d.value01/d.total))

            setMySVG(svg) ;

        }

    }, [sel])


    useEffect( () => {

        if (mySVG !== undefined && data.length > 0)
        {
            xScale = d3.scaleBand().domain(data.map(d => d.i)).range([sizes.left, sizes.width + sizes.left]).padding(.05) ;
            yScale = d3.scaleBand().domain(data.map(d => d.j)).range([sizes.top, sizes.height + sizes.top].reverse()).padding(.05) ;
            
            var colors = d3.scaleLinear()
                .domain([0, 1])
                .range(["#ffffff", "rgba(198, 45, 205, 0.8)"])

            mySVG.selectAll('.rect')
                .data(data)
                .transition()
                .duration(100)
                .attr('x', d => xScale(d.i))
                .attr('y', d => yScale(d.j))
                .attr('width', xScale.bandwidth())
                .attr('height', yScale.bandwidth())
                .attr('fill', d => colors(d.value01/d.total))
   
            //xScale = d3.scaleLinear().domain(d3.extent(data.map(d => d.index))).range([sizes.left, sizes.width + sizes.left]) ;
            //yScale = d3.scaleLinear().domain([0, 100]).range([sizes.height + sizes.top, sizes.top]) ;
        }

    }, [data])

    return (
        <></>
    )
}

export default MatrixChart ;