import React, { useState, useEffect } from 'react' ;
import * as d3 from 'd3' ;

const RingChart = ({ selector, data, label, color }) => {

    var radialScale = d3.scaleLinear() ;

    const [ sel, setSel ] = useState(undefined) ;
    const [ sizes, setSizes ] = useState(undefined) ;
    const [ mySVG, setMySVG ] = useState(undefined) ;

    const [valueLabel, setValueLabel] = useState(undefined) ;
    const [ ring, setRing ] = useState(undefined) ;

    const [ mLength, setMLength ] = useState(0) ;

    const arc = d3.arc()
            .startAngle(0)
            .cornerRadius(15) ;

    useEffect( () => {

        setSel(d3.select(selector)) ;

    }, [])

    useEffect( () => {

        if (sel !== undefined)
        {
            const minMargin = 20 ;
            var minLength = 0 ;
            const margin = { left : minMargin, right : minMargin, top : minMargin, bottom : minMargin } ;
            var bbox = sel.node().getBoundingClientRect() ;
            
            if (bbox.width > bbox.height)
            {
                minLength = bbox.height - minMargin * 2 ;
                margin.left = ( bbox.width - minLength ) / 2 ;
                margin.right = ( bbox.width - minLength ) / 2 ;
            }
            else
            {
                minLength = bbox.width - minMargin * 2 ;
                margin.top = (bbox.height - minLength)/2 ;
                margin.bottom = (bbox.height - minLength)/2 ;
            }
        
            let _sizes = {
                left : margin.left,
                top : margin.top,
                right : margin.left,
                bottom : margin.top,
                width : minLength,
                height : minLength
            }

            setSizes(_sizes) ;
            setMLength(minLength) ;

            arc
                .innerRadius( minLength/2 - 10  )
                .outerRadius( minLength/2 )


            radialScale = d3.scaleLinear()
                .range([0, 2 * Math.PI])
                .domain([0, 1]) ;
            
            let svg = sel
                .append("svg")
                .attr("width", _sizes.width + _sizes.left + _sizes.right)
                .attr("height", _sizes.height + _sizes.top + _sizes.bottom)
                .append("g")

            svg.append("text")
                .attr("x", bbox.width / 2)             
                .attr("y", 20)
                .attr("text-anchor", "middle")  
                .style("font-size", "12px")
                .style('stroke', '#3b3b3b') 
                .style('fill', '#3b3b3b') 
                .text(label) ;

            var _valueLabel = svg.append("text")
                .attr("x", bbox.width / 2)             
                .attr("y", bbox.height/2 + 10)
                .attr("text-anchor", "middle")  
                .style("font-size", "10px")
                .style('stroke', '#3b3b3b') 
                .style('fill', '#3b3b3b') 
                .text((data * 100).toFixed(0) + "%") ;
            setValueLabel(_valueLabel) ;

            var _ring = svg.selectAll(null)
                .data([data])
                .enter()
                .append('path')
                .attr('transform', 'translate(' + (_sizes.left + _sizes.width/2) + ',' + (_sizes.top + _sizes.height/2 + 10) + ')')
                .attr("d", arc.endAngle( d => radialScale(d)))
                .attr('stroke', 'none')
                .attr('fill', color)

            setRing(_ring) ;
            setMySVG(svg) ;

        }

    }, [sel])

    const arcTween = (a) => {
        var i = d3.interpolate(0, a);
    
        return function(t) {
          let _currentArc = i(t);
          return arc.endAngle(i(t))();
        };
      }


    useEffect( () => {

        if (mySVG !== undefined)
        {
            radialScale = d3.scaleLinear()
                .range([0, 2 * Math.PI])
                .domain([0, 1]) ;

            if (valueLabel !== undefined)
                valueLabel.text((data * 100).toFixed(0) + "%") ;
            if (ring !== undefined && arc !== undefined)
            {
                ring
                .data([data])
                .attr("d", 
                    d3.arc()
                        .innerRadius( mLength/2 - 10  )
                        .outerRadius( mLength/2 )
                        .startAngle(0)
                        .endAngle(d => radialScale(d))
                        .cornerRadius(15)
                )
                .attr('stroke', 'none')
                .attr('fill', color)

            }
   
            //xScale = d3.scaleLinear().domain(d3.extent(data.map(d => d.index))).range([sizes.left, sizes.width + sizes.left]) ;
            //yScale = d3.scaleLinear().domain([0, 100]).range([sizes.height + sizes.top, sizes.top]) ;
        }

    }, [data])

    return (
        <></>
    )
}

export default RingChart ;