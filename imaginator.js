import fontColorContrast from 'font-color-contrast'
import { fabric } from 'fabric'
import Color from 'color'

import logo_w_SVG from './SVG/logo-w.svg'
import logo_b_SVG from './SVG/logo-b.svg'
import whatsappSVG from './SVG/whatsapp.svg'


export class Imaginator {
    constructor(canvasId, width = 1140, height = 860) {
        this.width = width,
        this.height = height
        this.logo = {
            '#ffffff': logo_w_SVG,
            '#000000': logo_b_SVG
        }

        const canvasElem = document.getElementById(canvasId)

        const mainContainerElement = document.createElement('div')
        mainContainerElement.style.position = 'relative'
        mainContainerElement.style.width = '100%'
        mainContainerElement.style.paddingBottom = `${(this.height / this.width) * 100}%`
        mainContainerElement.style.background = 'grey'
        mainContainerElement.style.boxShadow = '3px 3px 30px rgba(0,0,0,.3)'
        mainContainerElement.style.borderRadius = '5px'
        mainContainerElement.style.overflow = 'hidden'

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
            width,
            height
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
        const TEXT_COLOR = fontColorContrast(BACKGROUND)
        this.TEXT_COLOR = TEXT_COLOR

        const {
            productName,
            price,
            ref,
            whatsapp,
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
        infoBackground.set('id', 'infoBg')
        canvas.add(infoBackground);
        this.objects.infoBgObject = infoBackground


        this.renderDivider()


        const companyLogoObject = await this.loadSVG(this.logo[TEXT_COLOR], {
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
        this.objects.companyLogoObject = companyLogoObject
        companyLogoObject.set('id', 'companyLogo')

        await this.renderSocials(whatsapp)

        // Textos para hacer referencias y poderlos editat mas adelante
        const priceText = new fabric.Textbox(price, {
            left: PADDING,
            top: canvas.getHeight() - 300,
            width: INFO_WIDTH - PADDING * 2,
            fontSize: 60,
            fontFamily: 'Roboto',
            fill: TEXT_COLOR,
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
            fill: TEXT_COLOR,
            fontWeight: 100,
            lockMovementX: true
        });
        refrefText.set('top', priceText.lineCoords.tl.y - refrefText.height - 25)
        refrefText.set('id', 'productNameRef')
        canvas.add(refrefText)




        this.objects = {
            ...this.objects,
            priceObject: priceText,
            productNameRefObject: refrefText,
        }

        return
    }

    addImage(file) {
        
        return new Promise(resolve => {
            const url = typeof file === 'string'? file : URL.createObjectURL(file)
            fabric.Image.fromURL(url, image => {
                image.left = this.INFO_WIDTH
                const scaleValue = fabric.util.findScaleToFit(image, this.canvas)
                image.scale(scaleValue)
                this.canvas.setActiveObject(image)
                this.canvas.add(image)
                resolve(image)
            })
        })
        
        /*
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
        */
    }

    loadSVG(url, props, callback) {
        return new Promise(resolve => {
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


    async renderSocials(whatsapp) {
        this.objects.whatsappObject && this.canvas.remove(this.objects.whatsappObject)
        this.objects.whatsappLogoObject && this.canvas.remove(this.objects.whatsappLogoObject)
        this.whatsapp = whatsapp
        if (this.whatsapp) {
            const whatsappLogoObject = await this.loadSVG(whatsappSVG, {
                lockMovementX: true,
                left: this.PADDING,
                selectable: false
            }, obj => {
                obj.scale(0.06)
                obj.set('top', this.canvas.getHeight() - obj.getScaledHeight() - (this.PADDING * 1))
            })
            whatsappLogoObject.set('id', 'whatsappLogo')
            const whatsappNumber = new fabric.Textbox(whatsapp, {
                left: this.PADDING,
                width: this.INFO_WIDTH - (this.PADDING * 3 + whatsappLogoObject.getScaledWidth()),
                fontSize: 24,
                fontFamily: 'Roboto',
                fill: this.TEXT_COLOR,
                fontWeight: 400,
                lockMovementX: false,
                selectable: false
            });
            whatsappNumber.set('id', 'whatsapp')
            whatsappNumber.setPositionByOrigin({ x: (this.PADDING * 1.5 + whatsappLogoObject.getScaledWidth()), y: whatsappLogoObject.getCenterPoint().y }, 'left', 'center')
            this.canvas.add(whatsappNumber)
            this.objects.whatsappObject = whatsappNumber
            this.objects.whatsappLogoObject = whatsappLogoObject
        }
        return
    }

    toJSON() {
        const canvas = this.canvas
        const json = canvas.toObject(['selectable', 'lockMovementX', 'lockMovementY', 'id'])
        console.log(json)
        return json
    }

    loadFromJSON(json, callback) {
        return new Promise(resolve => {
            this.canvas.clear()
            this.canvas.loadFromJSON(json, () => {
                this.canvas.forEachObject(obj => {
                    const id = obj.get('id')
                    if (!id) return
                    this.objects[id + 'Object'] = obj
                })
                callback && callback()
                this.canvas.renderAll.bind(this.canvas)
                console.log("JSON loaded!")
                resolve()
            });
        })

    }

    toDataURL(format = "jpeg", quality = 1) {
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

    async update(props) {
        //funcion para actualizar los texto de la imagen
        const { productName, ref, price, whatsapp, background } = props
        const { priceObject, productNameRefObject } = this.objects

        this.objects.infoBgObject && this.objects.infoBgObject.set('fill', background || this.BACKGROUND)
        const TEXT_COLOR = fontColorContrast(background || this.BACKGROUND)
        this.TEXT_COLOR = TEXT_COLOR

        if (this.objects.companyLogoObject) {
            const oldScaleX = this.objects.companyLogoObject.scaleX
            const oldPos = this.objects.companyLogoObject.getPointByOrigin('center', 'center')
            this.canvas.remove(this.objects.companyLogoObject)
            const companyLogoObject = await this.loadSVG(this.logo[TEXT_COLOR], {})
            companyLogoObject.scale(oldScaleX)
            companyLogoObject.set('lockMovementX', true)
            companyLogoObject.setPositionByOrigin(oldPos, 'center', 'center')
            companyLogoObject.set('id', 'companyLogo')
            this.objects.companyLogoObject = companyLogoObject
        }

        priceObject && priceObject.set('text', price || this.price)
        priceObject && priceObject.set('fill', TEXT_COLOR)


        productNameRefObject && productNameRefObject.set('text', `${productName || this.productName}\nRef. ${ref || this.ref}`)
        productNameRefObject && productNameRefObject.set('top', priceObject.lineCoords.tl.y - productNameRefObject.height - 25)
        productNameRefObject && productNameRefObject.set('fill', TEXT_COLOR)

        const wpValue = props.hasOwnProperty('whatsapp') ? whatsapp : this.whatsapp
        await this.renderSocials(wpValue)
        

        this.canvas.renderAll()
    }

    addVarianHook(hooks = 1) {
        if (hooks > 4 || hooks < 1) {
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

        const RADIUS = 80

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
                const circle1Center = circle1.getCenterPoint()


                const circle2Coords = circle2._getCoords()
                const circle2Center = circle2.getCenterPoint()

                const line1 = new fabric.Line([circle1Coords.br.x - circle1.strokeWidth, circle1Center.y, circle2Coords.br.x - circle2.strokeWidth, circle2Center.y], {
                    stroke: 'red',
                    strokeWidth: 4
                })
                const line2 = new fabric.Line([circle1Coords.bl.x, circle1Center.y, circle2Coords.bl.x, circle2Center.y], {
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


                const group = new fabric.Group([img, circle1, circle2, line1, line2], {
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

    lockCanvas(option = true) {
        if (!option) {
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

    removeBgFabric(imageFile) {
        const filter = new fabric.Image.filters.RemoveColor({
            distance: .055
        })

        const imageUrl = URL.createObjectURL(imageFile)
        return new Promise(resolve => {
            fabric.Image.fromURL(imageUrl, (image) => {
                const scaleValue = fabric.util.findScaleToFit(image, this.canvas)
                const rezise = new fabric.Image.filters.Resize({
                    scaleY: scaleValue * 2,
                    scaleX: scaleValue * 2
                })
                image.scale(scaleValue)
                image.filters.push(rezise)
                image.filters.push(filter)
                image.applyFilters()
                resolve(image)
            })
        })
    }

    async metalicColor(inputColor){
        const color = Color(inputColor)
        
        const darkColor = color.isDark() ? color.hsl().toString() : color.darken(0.32).toString()
        const darkColorObj = color.isDark() ? color : color.darken(0.32)
        const lightColor = color.isDark()? color.lighten(0.5).hsl().toString() : color.hsl().toString()
        const lightColorObj = color.isDark()? color.lighten(0.5) : color
        this.BACKGROUND = darkColorObj.mix(lightColorObj, 0.5).hex().toString()
        
    

        const info = this.objects.infoBgObject
        const gradient = new fabric.Gradient({
            type: 'linear',
            gradientUnits: 'pixels',
            coords: {x1: 0 - 100, y1: info.height , x2: info.width + 100, y2: 0},
            colorStops:[
                {offset: 0, color: darkColor},
                {offset: .15, color: lightColor},
                {offset: .30, color: darkColor},
                {offset: .41, color: lightColor},
                {offset: .606, color: darkColor},
                {offset: .718, color: lightColor},
                {offset: .86, color: lightColor},
                {offset: 1, color: darkColor}
            ]
        })
        await this.update({whatsapp: this.whatsapp})
        this.objects.infoBgObject.set('fill', gradient)
        this.canvas.renderAll()
        return
    }

    renderDivider(pos=320){
        const rect = new fabric.Rect({
            top: 0,
            height: this.canvas.height,
            width: 15,
            left: pos,
            fill: '#333',
            selectable: false
        })

        const tan60 = Math.tan(1.0472) //tanjente de 60 grados
        const angleDistance = ((rect.height/tan60) - rect.width) / 2

        const gradient = new fabric.Gradient({
            type: 'linear',
            gradientUnits: 'pixels',
            coords: {x1: 0 - angleDistance, y1: rect.height - 100 , x2: rect.width + angleDistance, y2: 100},
            colorStops:[
                {offset: 0, color: '#BA8B01'},
                {offset: .184, color: '#FFFFCB'},
                {offset: .298, color: '#FFFFCB'},
                {offset: .43, color: '#ECCE76'},
                {offset: .489, color: '#A26F14'},
                {offset: .605, color: '#A26F14'},
                {offset: .67, color: '#E4BA58'},
                {offset: .685, color: '#A65B1A'},
                {offset: .774, color: '#FFFFCD'},
                {offset: .795, color: '#FFFFCD'},
                {offset: .846, color: '#E5BD5D'},
                {offset: .886, color: '#BB913B'},
                {offset: .911, color: '#BB913B'},
                {offset: .95, color: '#C5992E'},
                {offset: 1, color: '#7F470A'},
            ]
        })
        rect.set('fill', gradient)
        this.canvas.add(rect)
    }

}

export class BackgoundRemover {
    constructor(canvasId, rangeId, width = 896, height = 1280) {
        this.width = width,
            this.height = height


        const range = document.getElementById(rangeId)
        range.setAttribute('min', '0')
        range.setAttribute('max', '0.3')
        range.setAttribute('step', '0.001')

        this.range = range

        const canvasElem = document.getElementById(canvasId)

        const mainContainerElement = document.createElement('div')
        mainContainerElement.style.position = 'relative'
        mainContainerElement.style.width = '100%'
        mainContainerElement.style.paddingBottom = `${(this.height / this.width) * 100}%`
        mainContainerElement.style.background = 'grey'
        mainContainerElement.style.boxShadow = '3px 3px 30px rgba(0,0,0,.3)'
        mainContainerElement.style.borderRadius = '5px'
        mainContainerElement.style.overflow = 'hidden'

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
            backgroundColor: '#222',
            width,
            height,
        });
        canvas.selection = false
        canvas.setDimensions({
            width: '100%',
            height: '100%'
        }, {
            cssOnly: true
        })
        this.canvas = canvas
    }

    async uploadImage(file) {
        this.range.removeEventListener('change', this.chanegeValue)
        this.canvas.forEachObject(obj => {
            this.canvas.remove(obj)
        })
        const imageNoBg = await this.removeBgFabric(file)
        imageNoBg.set('left', 0)
        imageNoBg.set('top', 0)
        imageNoBg.set('selectable', false)
        this.canvas.centerObjectH(imageNoBg)
        this.canvas.add(imageNoBg)
        this.currentImage = imageNoBg
        this.range.value = imageNoBg.filters[1].distance
        this.range.addEventListener('change', this.chanegeValue)
    }

    chanegeValue = e => {
        const value = e.target.value
        //console.log(value)
        this.currentImage.filters[1].distance = value
        this.currentImage.applyFilters()
        this.canvas.renderAll()
    }

    modifyDistance(value) {
        console.log(this)
        this.currentImage.filters[1].distance = value
        this.currentImage.applyFilters()
        this.canvas.renderAll()
    }

    removeBgFabric(imageFile) {
        const filter = new fabric.Image.filters.RemoveColor({
            distance: .055
        })

        const imageUrl = URL.createObjectURL(imageFile)
        return new Promise(resolve => {
            fabric.Image.fromURL(imageUrl, (image) => {
                const scaleValue = fabric.util.findScaleToFit(image, this.canvas)
                const rezise = new fabric.Image.filters.Resize({
                    scaleY: scaleValue,
                    scaleX: scaleValue
                })
                image.scale(scaleValue)
                image.filters.push(rezise)
                image.filters.push(filter)
                image.applyFilters()
                resolve(image)
            })
        })
    }

    async generateImage(){
        this.range.removeEventListener('change', this.chanegeValue)
        this.canvas.forEachObject(obj => this.canvas.remove(obj))
        const url = this.currentImage.toDataURL()
        const blob = await fetch(url).then(res => res.blob())
        this.currentImage = null
        return blob
    }

    cancel(){
        this.currentImage = null
        this.canvas.forEachObject(obj => this.canvas.remove(obj))
    }
}



