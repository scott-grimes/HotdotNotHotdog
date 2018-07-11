import React, { Component } from 'react';
import MainImage from './components/MainImage';
import Results from './components/Results';
import Carousel from './components/Carousel';
import {
  getPredictionFromServer,
  imageToPixelBlob
} from "./scripts/api";
import "./App.css";
//import logo from './logo.svg';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      mainImage: '/images/hotdogImages/hotdog.png', 
      randomImages: [], 
      allowSelection: true, 
      overlay: 'none',
      predictions:[]
     }; // can be 'none', 'ishotdog', 'notishotdog'
    this.fetchRandomImages = this.fetchRandomImages.bind(this);
    this.selectImage = this.selectImage.bind(this);
    this.predict = this.predict.bind(this);
    this.fetchRandomImages();
    this.predict(this.state.mainImage)
  }

  //given an img element, predict what the image is
  async predict(imgsrc) {
    const self = this;
    this.setState({predictions: []})
    const img = document.createElement("IMG");
    var found = false;
    img.onload = async function(){
      try{
        const pixelBlob = await imageToPixelBlob(this);
        console.log(pixelBlob)
        setTimeout(() => {
          if(!found){
            throw('Server Timeout')
          }
        }, 5000);
        const response = await getPredictionFromServer(pixelBlob);
        let predictions = null;
        
        if(response.status===200){
          found = true
          await response.json().then(res => predictions = res)
          console.log(predictions)
          self.setState({ predictions: predictions });
        }
        
      }catch(err){
        console.log(err)
        alert(err);
      }
      
    }
    img.src = imgsrc;

    
    /*
    let hotdogToken = 'Not Hotdog'
    hotdogToken = predictions[0].className.includes('hotdog') ? 'Maybe Hotdog' : hotdogToken;
    hotdogToken = predictions[0].probability > 0.9 ? 'Is Hotdog' : hotdogToken;
    let solution = 'Verdict: ';
    solution += hotdogToken;
    solution += '\n\nMachine Thinks this is...\n';
    for (let predict of predictions) {
      solution += predict.className + ' : ' + Math.floor(Math.round(predict.probability * 100)) + '%\n'
    }
    console.log(solution)
    return solution*/
  }

  fetchRandomImages() {
    
    return fetch('/random')
      .then(function (response) {
        return response.json();
      })
      .then(list => {
        this.setState({ randomImages: list });
      })
      .catch(err=>console.log(err));
    
  }


  selectImage(imgsrc) {
    if (!this.state.allowSelection) {
      return;
    }
    this.setState({allowSelection: false, mainImage: imgsrc});
    this.predict(imgsrc);
    setTimeout(()=>this.setState({allowSelection: true}), 1000);
    
  }

  render() {
    return <div className="App">
        {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="App-title">Welcome to React</h1>
      </header> */}
        <MainImage selectImage={this.selectImage} mainImage={this.state.mainImage} />
        <Results predictions={this.state.predictions} />
        <Carousel selectImage={this.selectImage} fetchRandomImages={this.fetchRandomImages} randomImages={this.state.randomImages} />
      </div>;
  }
}

export default App;
