//import {Imaginator} from './lib/imaginanor'
import Imaginator from './imaginator'

const fileInput = document.getElementById('file')
const btn = document.getElementById('btn')
const btnJson = document.getElementById('btn-json')


const imaginator = new Imaginator('b', 1140, 860)

imaginator.init({
    productName: 'Faja Latex Clásica 3 Hileras',
    ref: '1934-3',
    price: '$80.000',
    whatsapp: '+57 318 2657709',
    //background: '#E0CAB3'
})




fileInput.addEventListener('change', e => {
    const file = e.target.files[0]
    imaginator.addImage(file)
})

btn.addEventListener('click', () =>{
    const json = imaginator.toJSON()
    imaginator.loadFromJSON(json).then(()=>{
        imaginator.update({
            price: '$105.000',
            productName: 'Chaleco Latex Clasico Tira Ancha 3 Hileras',
            ref: '1935-3',
            whatsapp: '+57 321 7378301',
            background: '#b8c5d4'
        })
    })
})

//#127dff
//#E0CAB3
//#b8c5d4

let counter = true;
btnJson.addEventListener('click', ()=>{
    imaginator.addVarianHook(2)
    //imaginator.lockCanvas(counter)
    //ounter = !counter
})
