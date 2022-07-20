class ImageGenerator{
    canvas = document.getElementById("canvasExec");
    ctx = this.canvas.getContext("2d");
    img = null;
    width = 0;
    height = 0;

    // setting for delayDrawCanvas
    timeoutKey = 0;
    timeoutTime = 200;
    
    // load image and then draw canvas after img loaded
    // width and height can be empty, it mean auto
    loadImage(src, width, height){
        this.img = new Image();
        this.img.src = src;
        if (width > 0) this.img.width = width;
        if (height > 0) this.img.height = height;
        $(this.img).on("load", (function(self) {
            return function(){
                self.width = this.width;
                self.height = this.height;
                self.drawCanvas();
            }
        })(this));
    }
    
    bind(event, elem, method){
        $(elem).on(event, method);
    }
    // use timeout optimised the update count
    delayDrawCanvas = () => {
        clearTimeout(this.timeoutKey);
        this.timeoutKey = setTimeout((function(self){
            return function(){
                self.drawCanvas()
            }
        })(this), this.timeoutTime);
    }

    // draw canvas
    drawCanvas(){
        this.ctx.canvas.width = this.width;
        this.ctx.canvas.height = this.height;
        this.ctx.clearRect(0,0, this.width, this.height);
        this.ctx.drawImage(this.img, 0, 0, this.width, this.height);
        
        $("#demoImg")[0].src = this.canvas.toDataURL();  // load demo img
        
        let defaultColor = "#222222";
        let defaultFont = "800 180px 微軟正黑體";
        let defaulShadowBlur = 0; // text shadow size
        let defaultShadowOffsetY = 0; // text shadow y position
        let defaultShadowColor = ""; // text shadow y position
        let defaultLineWidth = 0; // text stroke width
        let defaultStrokeStyle = ""; // text stroke color
        let defaultTextX = this.width / 2; // text x postion
        let defaultTextY = this.height / 2; // text y postion
        let defaultMirrorY = false;    // mirror y
        let defaultMirrorSpace = 20;    // mirror space between two text
        $(".text_line").each((i, elem) => {
            this.ctx.save();
            
            // text style
            let color = elem.dataset.color ?? defaultColor;
            this.ctx.fillStyle = color;
            this.ctx.font = elem.dataset.font ?? defaultFont;

            // text align
            // this.ctx.textBaseline = "top";
            this.ctx.textAlign = "center";   

            // text shadow
            this.ctx.shadowBlur = elem.dataset.shadowSize ?? defaulShadowBlur;
            this.ctx.shadowOffsetY = elem.dataset.shadowOffsetY ?? defaultShadowOffsetY;
            this.ctx.shadowColor = elem.dataset.shadowColor ?? defaultShadowColor;

            // text stroke
            this.ctx.lineWidth = elem.dataset.strokeWidth ?? defaultLineWidth;  
            this.ctx.strokeStyle = elem.dataset.strokeStyle ?? defaultStrokeStyle;

            // draw text with stroke
            let x = elem.dataset.x ?? defaultTextX;
            let y = elem.dataset.y ?? defaultTextY;

            this.ctx.fillText(elem.value, x, y);
            this.ctx.strokeText(elem.value, x, y);

            // mirror
            if (elem.dataset.mirrorY ?? defaultMirrorY) {
                let mirrorSpace = elem.dataset.mirrorSpace ?? defaultMirrorSpace;
                this.ctx.scale(1, -1);
                let mirrorY = -(parseInt(y) + mirrorSpace);

                var grd = this.ctx.createLinearGradient(x, mirrorY, x, mirrorY - 200);
                grd.addColorStop(0, hexToRgbA(color, 0.4));
                grd.addColorStop(0.5, `transparent`);

                this.ctx.fillStyle = grd;
                this.ctx.fillText(elem.value, x, mirrorY);
            }

            this.ctx.restore();
        })

        $("#demoImg")[0].src = this.canvas.toDataURL();  // load demo img
    }
}


window.onload = function() {
    let imageGenerator = new ImageGenerator();
    // log config setting
    var configs;
    $.get("/assets/config/tool.json").then(function(data){
        configs = data;
        configs.forEach((element, ind) => {
        let btn = htmlToElement(`<button class="btn btn-outline-success me-2" data-key="${ind}" type="button">${element.name}</button>`)
        $("#template_nav").append(btn);
        btn.onclick = function(){
            $("#text_line").html("");

            config = configs[this.dataset.key];
            config.text_line.forEach(elem => {
                let dataSetting = "";
                for (dataName in elem['data']){    
                    dataSetting += `data-${dataName}="${elem['data'][dataName]}" `;
                }
                let lineElement = htmlToElement(`<div><label for="text_line_1" class="form-label">${elem['label']}</label>
                <input id="text_line_1" class="text_line form-control" ${dataSetting} type="text"/></div>`);
                $("#text_line").append(lineElement);
                imageGenerator.bind("keyup", $(lineElement).find(".text_line"), imageGenerator.delayDrawCanvas);
            });

            imageGenerator.loadImage(`/assets/img/tool/${config['template']}`);
        }
      });
    })
  }; 