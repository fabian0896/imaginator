
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
        canvas.selection = false
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


        this.productName = ''
        this.ref = ''
        this.price = ''

        this.objects = {}
    

    }

    async init(values) {
        const canvas = this.canvas
        const INFO_WIDTH = values.infoWidth || this.INFO_WIDTH
        const BACKGROUND = values.background || this.BACKGROUND
        const PADDING = values.padding || this.PADDING

        const {
            productName,
            price,
            ref,
            whatsapp
        } = values

        this.productName = productName
        this.price = price
        this.ref = ref
        this.whatsapp = whatsapp 

        const infoBackground = new fabric.Rect({
            left: 0,
            top: -0,
            fill: BACKGROUND,
            width: INFO_WIDTH,
            height: canvas.getHeight() + 1,
            selectable: false
        });
        canvas.add(infoBackground);


        await this.loadSVG('./SVG/divider.svg',{
            top: -20,
            scaleY: 2.5,
            scaleX: 1,
            left: INFO_WIDTH,
            selectable: false
        })

       
        await this.loadSVG('./SVG/logo-w.svg',{
            lockMovementX: true,
            left: PADDING,
            top: PADDING * 2,
            selectable: true
        }, obj => {
            const logoWidth = obj.width
            const containerWidth = infoBackground.width
            const scaleValue = (containerWidth - (PADDING * 2)) / logoWidth
            obj.scale(scaleValue)
        })

       
        const whatsappLogoObject = await this.loadSVG('./SVG/whatsapp.svg',{
            lockMovementX: true,
            left: PADDING,
            selectable: false
        }, obj => {
            obj.scale(0.06)
            obj.set('top', canvas.getHeight() - obj.getScaledHeight() - (PADDING * 2)) 
        })
        
        // Textos para hacer referencias y poderlos editat mas adelante
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
        priceText.set('id', 'price')
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
        refrefText.set('id', 'productNameRef')
        canvas.add(refrefText)


        const whatsappNumber = new fabric.Textbox(whatsapp , {
            left: PADDING,
            width: infoBackground.width - (PADDING * 3 + whatsappLogoObject.getScaledWidth()),
            fontSize: 25,
            fontFamily: 'Roboto',
            fill: '#fff',
            fontWeight: 200,
            lockMovementX: false,
            selectable: false
        });
        whatsappNumber.set('id', 'whatsapp')
        whatsappNumber.setPositionByOrigin({ x: (PADDING * 2 + whatsappLogoObject.getScaledWidth()), y: whatsappLogoObject.getCenterPoint().y }, 'left', 'center')
        canvas.add(whatsappNumber)

        this.objects = {
            priceObject: priceText,
            productNameRefObject: refrefText,
            whatsappObject: whatsappNumber
        }

        return
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


    loadSVG(url, props, callback){
        return new Promise(resolve =>{
            fabric.loadSVGFromURL(url, (objects, options) => {
                const obj = fabric.util.groupSVGElements(objects, options);
                Object.keys(props).forEach(prop => {
                    obj.set(prop, props[prop])
                })
                callback && callback(obj)
                this.canvas.add(obj)
                resolve(obj)
            })
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

                if (r >= 242 && g >= 242 && b >= 242) {
                    image.setIntColor(x, y, 0);
                }
            }
        }
    }


    toJSON() {
        const canvas = this.canvas
        const json = canvas.toObject(['selectable', 'lockMovementX', 'lockMovementY', 'id'])
        console.log(json)
        return json
    }


    loadFromJSON(json, callback){
        return new Promise(resolve => {
            this.canvas.clear()
            this.canvas.loadFromJSON(json, ()=>{
                this.canvas.forEachObject(obj => {
                    const id = obj.get('id')
                    if(!id) return
                    this.objects[id + 'Object'] = obj
                })
                callback && callback()
                this.canvas.renderAll.bind(this.canvas)
                console.log("JSON loaded!")
                resolve()
            });
        })
       
    }


    toDataURL(format="jpeg", quality=1) {
        const result = this.canvas.toDataURL({
            format,
            quality,
            multiplier: 2
        })

        //const img = new Image()
        //img.src = result
        //document.body.appendChild(img)
        return result
    }


    update(props){
        //funcion para actualizar los texto de la imagen
        const {productName, ref, price, whatsapp} = props
        const {priceObject, productNameRefObject, whatsappObject} = this.objects
        
        priceObject && priceObject.set('text', price || this.price)
        
        productNameRefObject && productNameRefObject.set('text', `${productName || this.productName}\nRef. ${ref || this.ref}`)
        productNameRefObject && productNameRefObject.set('top', priceObject.lineCoords.tl.y - productNameRefObject.height - 25)
        
        whatsappObject && whatsappObject.set('text', whatsapp || this.whatsapp)
    
        this.canvas.renderAll()
    }

    addVarianHook(hooks=1){
        if(hooks > 4 || hooks < 1){
            throw new Error('El valor de hooks tiene que estar entre 1 y 4')
        }

        let oldPosition = this.objects.hooksObject ? this.objects.hooksObject.getPointByOrigin('center', 'center') : null
        this.objects.hooksObject && this.canvas.remove(this.objects.hooksObject)

        const hooksImages = [
            'https://i.ibb.co/vJDQhpC/hooks-1.jpg',
            'https://i.ibb.co/Q6D78sK/hooks-2.jpg',
            'https://i.ibb.co/BjrKY6k/hooks-3.jpg',
            'https://i.ibb.co/zVyNmB1/hooks-4.jpg'
        ]
  
        const RADIUS = 70
        
        return new Promise(resolve => {

            fabric.Image.fromURL(hooksImages[hooks - 1], img => {
                const circle1 = new fabric.Circle({
                    radius: 40, 
                    fill: 'transparent', 
                    left: 400, 
                    top: 100,
                    stroke: 'red',
                    strokeWidth: 4,
                    originX: 'center'
                })
           
                const circle2 = new fabric.Circle({
                    radius: RADIUS, 
                    fill: 'transparent', 
                    left: 400, 
                    top: 350,
                    stroke: 'red',
                    strokeWidth: 4,
                    originX: 'center'
                })
        
                const circle1Coords = circle1._getCoords()
                const circle1Center =  circle1.getCenterPoint()
                
                
                const circle2Coords = circle2._getCoords()
                const circle2Center =  circle2.getCenterPoint()
                
                const line1 = new fabric.Line([circle1Coords.br.x - circle1.strokeWidth, circle1Center.y , circle2Coords.br.x - circle2.strokeWidth, circle2Center.y],{
                    stroke: 'red',
                    strokeWidth: 4
                })
                const line2 = new fabric.Line([circle1Coords.bl.x, circle1Center.y , circle2Coords.bl.x, circle2Center.y],{
                    stroke: 'red',
                    strokeWidth: 4
                })
        
                const scaleImageValue = fabric.util.findScaleToFit(img, circle2)
                img.scale(scaleImageValue)
                
                
    
                img.set({
                    left: circle2Center.x, 
                    top: circle2Center.y,
                    originX: 'center',
                    originY: 'center',
                    angle: 40,
                    clipPath: new fabric.Circle({
                        radius: img.width / 2,
                        originX: 'center',
                        originY: 'center',
                      })
                })
    
                circle2.bringToFront()
    
    
                const group = new fabric.Group([img, circle1, circle2, line1, line2],{
                    angle: -40,
                    id: 'hooks'
                })
    
                oldPosition && group.setPositionByOrigin(oldPosition, 'center', 'center')
    
        
                group.bringToFront()
                this.canvas.setActiveObject(group)
                this.objects['hooksObject'] = group
                this.canvas.add(group)
                resolve()
            })

        })

    }

    lockCanvas(option=true){
        if(!option){
            this.objects.lockRectObject && this.canvas.remove(this.objects.lockRectObject)
            console.log("se quito el bloqueo")
            return
        }
        const rect = new fabric.Rect({
            left: 0,
            top: 0,
            fill: 'transparent',
            width: this.width,
            height: this.height,
            selectable: false,
            excludeFromExport: true,
            hoverCursor: 'not-allowed'
        });
        this.objects.lockRectObject = rect
        this.canvas.add(rect);
    }

}


//----------------- CODIGO PARA TEST ----------------------
const fileInput = document.getElementById('file')
const btn = document.getElementById('btn')
const btnJson = document.getElementById('btn-json')
const imaginator = new Imaginator('b', 1140, 860)

imaginator.init({
    productName: 'Faja Latex Clásica 3 Hileras',
    ref: '1934-3',
    price: '$80.000',
    whatsapp: '+57 318 2657709'
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
        })
    })
})

let counter = true;
btnJson.addEventListener('click', ()=>{
    imaginator.lockCanvas(counter)
    counter = !counter
})

