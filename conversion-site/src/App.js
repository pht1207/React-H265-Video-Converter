import './App.css';
import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import FileButton from './components/FileButton';

function App() {

  const [componentCount, setComponentCount] = useState(0);
  const [components, setComponents] = useState([<FileButton backgroundColor="rgba(228, 227, 227, 0.349)" key={componentCount-1} index={componentCount-1}/>]);

  const createComponent = () => {
    setComponentCount(componentCount + 1);
    let color = "white";
    if(componentCount%2 !== 0){
      color = "rgba(228, 227, 227, 0.349)";
    }
    setComponents([...components, <FileButton backgroundColor={color} key={componentCount} index={componentCount} />]);
  };

  //make some sort of way to have 'new file' and make another filebutton appear, probably do this by putting it in an array and adding to the array? idk. likely will have to be done with passing var thru filebuttont to app to see if form is filled w/ file
  return (
    <div className="App">
      <h1>Parker's Transcoder App</h1>
      <p className='Description'>This app converts video to H265/HEVC (Compressed video codec)</p>
      <div className='ButtonHolder'>
      {components.map((component, index) => (
        <>{component}</>
      //this is meant to dynamically create the filebutton 
      ))}
      </div>
      <label className='ConvertMoreButton'>Convert More<button onClick={createComponent}>Convert More</button></label>
    </div>
  );
}

export default App;
