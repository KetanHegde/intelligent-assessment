import React from 'react'

function Welcome({title}) {
  return (
    <div style={{backgroundImage:"linear-gradient(90deg, #275e69 20%, #93dfef 80%)", color:"white",padding:"4%"}}>
        <div>
            <h5>Hi Abhishek,</h5>
        </div>
        <div>
            <h4>Welcome to Our {title}</h4>
        </div>
    </div>
  )
}

export default Welcome
