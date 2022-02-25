class SvfTo3D {
    constructor( domELement ) {
        this.domElement = domELement
        this.clock = new THREE.Clock()
        this.geometry = new THREE.Geometry()
        this.gallery = []
        this.init()
    }

    init() {
        this.initScene()
        this.initCamera()
        this.initControls()
        this.createTempCanvas()

        this.initRenderer()

        let i = 0
        const animate = () => {
            i++
            window.requestAnimationFrame( animate )
            this.renderer.render( this.scene, this.camera )
            this.resizeRender()

            this.geometry.vertices.forEach((particle, index) => {
                let dX = Math.sin(i/10 + index / 2)/ 10;
                let dY = 0;
                let dZ = 0;
                particle.add(new THREE.Vector3(dX,dY,dZ))
            })
            this.geometry.verticesNeedUpdate = true

        }

        window.addEventListener( 'resize', this.resizeRender )

        let current = 0
        document.body.addEventListener('click', () => {
            current++
            current = current % this.gallery.length
            this.geometry.vertices.forEach((particle, index) => {
                 gsap.to(particle, 1, {
                    x: this.gallery[current][index][0],
                    y: this.gallery[current][index][1]
                })

            })
            })

        animate()
    }
    fillUp(array, max) {
        let length = array.length
        for(let i = 0; i< max - length; i++) {
            array.push(array[Math.floor(Math.random()*length)])
        }
        return array
    }
    loadImages(paths, whenLoaded) {
        let imgs = []
        paths.forEach((path) => {
            let img = new Image()
            img.onload = () => {
                imgs.push(img)
                if(imgs.length == paths.length) whenLoaded(imgs)
            }
            img.src = path
        })
    }
    getArrayFromImage(image) {
        let imageCoords = []
        this.ctx.clearRect(0,0,this.SIZE,this.SIZE)
        this.ctx.drawImage(image,0,0,this.SIZE,this.SIZE)
        let data = this.ctx.getImageData(0,0,this.SIZE,this.SIZE)
        data = data.data

        for(let y = 0; y<this.SIZE; y++) {
            for(let x = 0; x< this.SIZE; x++) {
                let alpha = data[((this.SIZE * y) + x) * 4 + 3]
                if(alpha > 0) {
                    imageCoords.push([10*(x - this.SIZE/2),10*(this.SIZE/2 - y)]);
                }
            }
        }
        return this.fillUp(imageCoords, 1500)

    }
    createTempCanvas() {
        this.SIZE = 50
        const canvas = document.createElement('canvas')
        this.ctx = canvas.getContext('2d')
        canvas.width = this.SIZE
        canvas.height = this.SIZE

        const images = ['/img/arrow.svg', '/img/close.svg','/img/place.svg']
        this.loadImages(images, (loadedImages) => {
            loadedImages.forEach(image => {
                this.gallery.push(this.getArrayFromImage(image))
            })
            this.createObject()
        })
    }

    initScene() {
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color( 256, 256, 256 )
    }

    initCamera() {
        this.camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 3000 )
        this.camera.position.z =500
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
    }

    initControls() {
        this.controls = new THREE.OrbitControls( this.camera, this.domElement )
    }

    initLight() {
        this.light = new THREE.AmbientLight(0x000000, 1)
    }

    resizeRender() {
        // Update sizes
        if ( this.domElement ) {
            // this.sizes.width = this.domElement.offsetWidth
            // this.sizes.height = this.domElement.offsetHeight

            // Update camera
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()

            // Update renderer
            this.renderer.setSize( window.innerWidth, window.innerHeight )
            this.renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) )
        }
    }

    createObject() {
        const texture = new THREE.TextureLoader().load( '/img/particle.png' )
        const material = new THREE.PointCloudMaterial( {
            size: 7,
            vertexColors: THREE.VertexColors,
            map: texture,
            alphaTest: 0.5
        } )

        this.gallery[0].forEach((el, inx) => {
            this.geometry.vertices.push(new THREE.Vector3(el[0],el[1],Math.random() * 100))
            this.geometry.colors.push(
                new THREE.Color(Math.random(),Math.random(),Math.random()),
            )
        })
        const pointCloud = new THREE.PointCloud(this.geometry, material)
        this.scene.add(pointCloud)
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setPixelRatio( window.devicePixelRatio )
        this.renderer.setSize( window.innerWidth, window.innerHeight )
        this.domElement.appendChild( this.renderer.domElement )
    }


}

const dom = new SvfTo3D( document.querySelector( '.viewer' ) )
