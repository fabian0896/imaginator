// Referencia al input File
const fileInput = document.getElementById('file')
const btn = document.getElementById('btn')


const productName = 'Faja Latex clasica 3 hileras'
const ref = '1934-4'
const price = '$80.000'


//Creacion del canvas para crear la composicion de las imagenes
const canvas = new fabric.Canvas('c', {
    backgroundColor: '#fff',
    width: 570,
    height: 430
});



canvas.setDimensions({
    width: '100%',
    height: '100%'
}, {
    cssOnly: true
})


//----------------- Creacion del Layout --------------------------
const infoBackground = new fabric.Rect({
    left: -1,
    top: -1,
    fill: '#292926',
    width: 161,
    height: canvas.getHeight() + 1,
    selectable: false
});
canvas.add(infoBackground);



fabric.loadSVGFromURL('./SVG/divider.svg', (objects, options) => {
    const obj = fabric.util.groupSVGElements(objects, options);
    obj.set('top', -20)
    obj.set('scaleY', 1.2)
    obj.set('scaleX', 0.8)
    obj.set('left', 160)
    obj.set('selectable', false)
    canvas.add(obj)
})


const productNameText = new fabric.Textbox(`${productName}`, {
    left: 10,
    top: 20,
    width: 150,
    fontSize: 15,
    fontFamily: 'Arial',
    fill: '#fff'
});

canvas.add(productNameText)

const refrefText = new fabric.Textbox('Ref. ' + ref, {
    left: 10,
    top: productNameText.lineCoords.bl.y + 10,
    width: 150,
    fontSize: 15,
    fontFamily: 'Arial',
    fill: '#fff',
    fontWeight: 400
});

canvas.add(refrefText)






//---------------------- Obtener la imagen ------------------------------------
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0]
    const image = await removeBg(file)
    addImageToCanvas(image)
})


btn.addEventListener('click', () => {
    const result = canvas.toDataURL({
        format: 'jpeg',
        quality: 1
    })

    const img = new Image()
    img.src = result
    document.body.appendChild(img)
})


//--------------------- Funciones para crear la composicion de la imagen --------------------


function addImageToCanvas(image) {
    const url = URL.createObjectURL(image)
    fabric.Image.fromURL(url, oImg => {
        const { height } = oImg.getOriginalSize()
        const canvasHeight = canvas.getHeight()
        const scaleValue = canvasHeight / height
        oImg.scale(scaleValue)
        canvas.add(oImg)
    })
}




//------------------- Funciones para remover el fondo blanco ------------------------------

function whiteToAlpha(image) {
    for (var y = 0; y < image.getHeight(); y++) {

        for (var x = 0; x < image.getWidth(); x++) {
            var r = image.getIntComponent0(x, y);
            var g = image.getIntComponent1(x, y);
            var b = image.getIntComponent2(x, y);

            if (r >= 250 && g >= 250 && b >= 250) {
                image.setIntColor(x, y, 0);
            }
        }
    }
}

function removeBg(fileImage) {
    return new Promise((resolve, reject) => {
        const image = new MarvinImage()
        const imageUrl = URL.createObjectURL(fileImage)
        image.load(imageUrl, () => {
            whiteToAlpha(image);
            Marvin.alphaBoundary(image.clone(), image, 8);
            //Marvin.scale(image.clone(), image , 1000);
            console.log("background removed!")
            resolve(image.toBlob())
        })
    })
}