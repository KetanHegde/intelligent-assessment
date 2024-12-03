import React from 'react';

function SvgComponent({
    color, 
    width, 
    max_width,
    height, 
    children,
    viewBox = "0 0 713.74209 454.87759"
}) {
    const svgContent = children || (
        <path d="m453.1968,107.36023h-.00003c-18.90326,3.69375-33.0921,19.43311-34.81262,38.61688l-11.76634,131.19472h20.64802l25.93097-169.81159Z" fill={color} strokeWidth="0"></path>
    );

    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={width} 
            height={height} 
            viewBox={viewBox}
            style={{maxWidth : max_width}}
        >
            {React.Children.map(svgContent, child => 
                React.isValidElement(child) 
                    ? React.cloneElement(child, { fill: color }) 
                    : child
            )}
        </svg>
    );
}

export default SvgComponent;