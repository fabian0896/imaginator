


class Imaginator {
    constructor(canvasId, width, height) {
        this.width = width,
            this.height = height

        const canvasElem = document.getElementById(canvasId)

        const mainContainerElement = document.createElement('div')
        mainContainerElement.style.position = 'relative'
        mainContainerElement.style.width = '100%'
        mainContainerElement.style.paddingBottom = `${(this.height / this.width) * 100}%`
        mainContainerElement.style.background = 'grey'

        const secondContainerElement = document.createElement('div')
        secondContainerElement.style.position = 'absolute'
        secondContainerElement.style.top = 0
        secondContainerElement.style.bottom = 0
        secondContainerElement.style.left = 0
        secondContainerElement.style.right = 0



        mainContainerElement.appendChild(secondContainerElement)
        canvasElem.replaceWith(mainContainerElement)
        secondContainerElement.appendChild(canvasElem)

        const canvas = new fabric.Canvas(canvasId, {
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


        this.canvas = canvas
        this.INFO_WIDTH = 320
        this.PADDING = 25
        this.BACKGROUND = '#292926'


        this.priceText = null

    }

    init(values) {
        const canvas = this.canvas
        const INFO_WIDTH = values.infoWidth || this.INFO_WIDTH
        const BACKGROUND = values.background || this.BACKGROUND
        const PADDING = values.padding || this.PADDING

        const {
            productName,
            price,
            ref,
        } = values



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

        this.refrefText = refrefText
        this.priceText = priceText

    }

    async addImage(file) {
        const image = await this.removeBg(file)
        const url = URL.createObjectURL(image)
        fabric.Image.fromURL(url, oImg => {
            const { height } = oImg.getOriginalSize()
            const canvasHeight = this.canvas.getHeight()
            const scaleValue = canvasHeight / height
            oImg.scale(scaleValue)
            oImg.set('left', this.INFO_WIDTH)
            this.canvas.setActiveObject(oImg)
            this.canvas.add(oImg)
            return
        })
    }

    removeBg(fileImage) {
        return new Promise((resolve, reject) => {
            const image = new MarvinImage()
            const imageUrl = URL.createObjectURL(fileImage)
            image.load(imageUrl, () => {
                this.whiteToAlpha(image);
                Marvin.alphaBoundary(image.clone(), image, 8);
                //Marvin.scale(image.clone(), image , 1000);
                console.log("background removed!")
                resolve(image.toBlob())
            })
        })
    }

    whiteToAlpha(image) {
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

    toJSON() {
        const canvas = this.canvas
        const json = canvas.toJSON()
        console.log(json)
        console.log("")
        return json
    }

    loadFromJSON(json){
        this.canvas.clear()
        this.canvas.loadFromJSON(json, this.canvas.renderAll.bind(this.canvas));
        console.log("cargo la da")
    }

    toDataURL(format="jpeg", quality=1) {
        const result = this.canvas.toDataURL({
            format,
            quality,
            multiplier: 2
        })

        const img = new Image()
        img.src = result
        document.body.appendChild(img)
        return result
    }

    clear(){
        this.refrefText.set('id', "123456789")
        this.refrefText.set('top', this.priceText.lineCoords.tl.y - this.refrefText.height - 25)
        this.canvas.renderAll()
        console.log("se actualizo el texto")
     
    }



}



const fileInput = document.getElementById('file')
const btn = document.getElementById('btn')
const imaginator = new Imaginator('b', 1140, 860)

imaginator.init({
    productName: 'Faja Latex Clásica 3 Hileras',
    ref: '1934-3',
    price: '$80.000',
    whatsapp: true,
})


fileInput.addEventListener('change', e => {
    const file = e.target.files[0]
    imaginator.addImage(file)
})

btn.addEventListener('click', () =>{
    //imaginator.clear()
    imaginator.toJSON()
})