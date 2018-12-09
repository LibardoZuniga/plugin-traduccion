window.localStorage.removeItem("jsonBody");
window.localStorage.removeItem("settings");
/**
 * Clase que traduce los elementos del dom a pesar de los cambios en el mismo
 * JSON {"url":"language.json",language":"english"}
 */
class Traslator {
    //
    constructor(settings) {
        this.settings = settings;
        this.loadingInit();
        localStorage.setItem("settings", JSON.stringify(settings));
        localStorage.setItem("exception", 'false');
        this.jsonBody(this).then((r) => {
            this.jsonLanguage = r;
            this.render(JSON.parse(r), this);
        }).catch(() => {
            console.log('No fue posible traer el json de la url enviada');
        });
    }
    //Carga el Json del archivo externo
    jsonBody(element) {
        return new Promise(function(resolve, reject) {
            if (typeof localStorage.jsonBody === 'string') {
                resolve(localStorage.jsonBody);
            } else {
                var xhr = new XMLHttpRequest;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        localStorage.setItem("jsonBody", xhr.responseText);
                        resolve(xhr.responseText);
                    } else {}
                }
                xhr.open("GET", element.settings.url)
                xhr.send();
            }
        })
    }
    render(jsonReplace, element) {
        var domBody = document.body.innerHTML;
        let selectLanguage = element.searchKey(jsonReplace, element.settings.language);
        if(typeof selectLanguage!=='undefined'){
            var cont=0;
            for (var index in selectLanguage) {
                cont++;
                domBody = domBody.replace(index, selectLanguage[index]);

                if(cont===Object.keys(selectLanguage).length){
                     document.body.innerHTML = domBody;
                     element.loadingClose();

                }
            }
        }else{
            console.log('No se encuentra el lenaguaje '+element.settings.language)
        }

        //element.loadingClose();
        
    }
    searchKey(obj, key = 'key') {
        return Object.keys(obj).reduce((finalObj, objKey) => {
            if (objKey !== key) {
                return searchKey(obj[objKey]);
            } else {
                return finalObj = obj[objKey];
            }
        }, [])
    }
    cssLoading() {
    
    }

    loadingInit(){
        let body = `<div id="bodyLoading" class="background">
                        <div class="lds-hourglass">
                        </div>
                    </div>`;
        document.body.innerHTML=document.body.innerHTML+body;

    }

    loadingClose(){
        localStorage.exception='true';
        var d_nested = document.getElementById("bodyLoading");
        console.log(d_nested);
             document.body.removeChild(d_nested);
    }
}
//<------------------------------------------------------------//--------------------------------------->
//En esta seccion se realiza la funcion para capturar los cambios en el DOM
//
(function(window) {
    var last = +new Date();
    var delay = 250; // default delay
    var stack = [];

    function callback() {
        var now = +new Date();
        if (now - last > delay) {
            for (var i = 0; i < stack.length; i++) {
                stack[i]();
            }
            last = now;
        }
    }
    var onDomChange = function(fn, newdelay) {
        if (newdelay) delay = newdelay;
        stack.push(fn);
    };

    function naive() {
        var last = document.getElementsByTagName('*');
        var lastlen = last.length;
        var timer = setTimeout(function check() {
            var current = document.getElementsByTagName('*');
            var len = current.length;
            if (len != lastlen) {
                last = [];
            }
            for (var i = 0; i < len; i++) {
                if (current[i] !== last[i]) {
                    callback();
                    last = current;
                    lastlen = len;
                    break;
                }
            }
            setTimeout(check, delay);
        }, delay);
    }
    var support = {};
    var el = document.documentElement;
    var remain = 3;

    function decide() {
        if (support.DOMNodeInserted) {
            window.addEventListener("DOMContentLoaded", function() {
                if (support.DOMSubtreeModified) {
                    el.addEventListener('DOMSubtreeModified', callback, false);
                } else {
                    el.addEventListener('DOMNodeInserted', callback, false);
                    el.addEventListener('DOMNodeRemoved', callback, false);
                }
            }, false);
        } else if (document.onpropertychange) {
            document.onpropertychange = callback;
        } else {
            naive();
        }
    }

    function test(event) {
        el.addEventListener(event, function fn() {
            support[event] = true;
            el.removeEventListener(event, fn, false);
            if (--remain === 0) decide();
        }, false);
    }
    if (window.addEventListener) {
        test('DOMSubtreeModified');
        test('DOMNodeInserted');
        test('DOMNodeRemoved');
    } else {
        decide();
    }
    var dummy = document.createElement("div");
    el.appendChild(dummy);
    el.removeChild(dummy);
    window.onDomChange = onDomChange;
})(window);
onDomChange(function() {
    if (typeof localStorage.settings == 'string' && localStorage.exception!=='true') {
    console.log("moduifica DOM!");

        var Traslators = new Traslator(JSON.parse(localStorage.settings));
    }else if(localStorage.exception==='true'){
        localStorage.exception='false';
    }
});

document.addEventListener("DOMContentLoaded", function(event) { 
      var hoja = document.createElement('style')
        hoja.innerHTML = `            .lds-hourglass {
                                                        left: calc(50% - 32px);
                                        top: calc(50% - 32px);
                                      display: inline-block;
                                      position: relative;
                                      width: 64px;
                                      height: 64px;
                                    }
                                    .lds-hourglass:after {
                                      content: " ";
                                      display: block;
                                      border-radius: 50%;
                                      width: 0;
                                      height: 0;
                                      margin: 6px;
                                      box-sizing: border-box;
                                      border: 26px solid #fff;
                                      border-color: #fff transparent #fff transparent;
                                      animation: lds-hourglass 1.2s infinite;
                                    }
                                    @keyframes lds-hourglass {
                                      0% {
                                        transform: rotate(0);
                                        animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
                                      }
                                      50% {
                                        transform: rotate(900deg);
                                        animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
                                      }
                                      100% {
                                        transform: rotate(1800deg);
                                      }
                                    }
                                    .background{
                                        position: absolute;
                                        width: 98%;
                                        height: 98%;
                                        background: rgba(0,0,0,0.8);
                                        top: 1%;
                                        left: 1%;
                                        color: white;
                                    }`;

        document.body.appendChild(hoja);
});