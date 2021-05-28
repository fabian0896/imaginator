// Referencia al input File
const fileInput = document.getElementById('file')
const btn = document.getElementById('btn')
const jsonBtn = document.getElementById('btn-json')

const productName = 'Faja Latex clasica 3 hileras'
const ref = '1934-4'
const price = '$80.000'

const PADDING = 25
const BACKGROUND = '#292926'
const INFO_WIDTH = 320



//Creacion del canvas para crear la composicion de las imagenes
const canvas = new fabric.Canvas('c', {
    backgroundColor: '#fff',
    width: 1140,
    height: 860
});


canvas.setDimensions({
    width: '100%',
    height: '100%'
}, {
    cssOnly: true
})



jsonBtn.addEventListener('click', () => {
    const json = canvas.toJSON()
    canvas.clear()
    canvas.loadFromJSON(json, canvas.renderAll.bind(canvas));
    console.log("cargo la da")
    console.log(json)
})



//----------------- Creacion del Layout --------------------------

// Container Para info de prenda
const infoBackground = new fabric.Rect({
    left: 0,
    top: -0,
    fill: BACKGROUND,
    width: INFO_WIDTH,
    height: canvas.getHeight() + 1,
    selectable: false
});
canvas.add(infoBackground);



fabric.loadSVGFromURL('./SVG/divider.svg', (objects, options) => {
    const obj = fabric.util.groupSVGElements(objects, options);
    obj.set('top', -20)
    obj.set('scaleY', 2.5)
    obj.set('scaleX', 1)
    obj.set('left', INFO_WIDTH)
    obj.set('selectable', false)
    canvas.add(obj)
})


// Logo de la empresa
fabric.loadSVGFromURL('./SVG/logo-w.svg', (objects, options) => {
    const obj = fabric.util.groupSVGElements(objects, options);
    obj.set('lockMovementX', true)
    const logoWidth = obj.width
    const containerWidth = infoBackground.width

    const scaleValue = (containerWidth - (PADDING * 2)) / logoWidth
    obj.scale(scaleValue)
    obj.set('left', PADDING)
    obj.set('top', PADDING * 2)
    obj.set('selectable', true)
    canvas.add(obj)
})



// Info de WhatsApp
fabric.loadSVGFromURL('./SVG/whatsapp.svg', (objects, options) => {
    const obj = fabric.util.groupSVGElements(objects, options);
    obj.set('lockMovementX', true)
    obj.scale(.06)
    obj.set('left', PADDING)
    obj.set('top', canvas.getHeight() - obj.getScaledHeight() - (PADDING * 2))
    obj.set('selectable', false)
    canvas.add(obj)

    const whatsappNumber = new fabric.Textbox('+57 318 2657709', {
        left: PADDING,
        width: infoBackground.width - (PADDING * 3 + obj.getScaledWidth()),
        fontSize: 25,
        fontFamily: 'Roboto',
        fill: '#fff',
        fontWeight: 200,
        lockMovementX: false,
        selectable: false
    });
    whatsappNumber.setPositionByOrigin({ x: (PADDING * 2 + obj.getScaledWidth()), y: obj.getCenterPoint().y }, 'left', 'center')
    canvas.add(whatsappNumber)
})







// Información de la prenda
const priceText = new fabric.Textbox(price, {
    left: PADDING,
    top: canvas.getHeight() - 300,
    width: INFO_WIDTH - PADDING * 2,
    fontSize: 60,
    fontFamily: 'Roboto',
    fill: '#fff',
    fontWeight: 400,
    lockMovementX: true
});
canvas.add(priceText)


const refrefText = new fabric.Textbox(`${productName}\nRef. ${ref}`, {
    left: PADDING,
    width: INFO_WIDTH - PADDING * 2,
    fontSize: 30,
    fontFamily: 'Roboto',
    fill: '#fff',
    fontWeight: 200,
    lockMovementX: true
});
refrefText.set('top', priceText.lineCoords.tl.y - refrefText.height - 25)
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
        oImg.set('left', INFO_WIDTH)
        canvas.setActiveObject(oImg)
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

            if (r >= 245 && g >= 245 && b >= 245) {
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