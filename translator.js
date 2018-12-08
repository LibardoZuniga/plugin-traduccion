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
        localStorage.setItem("settings", JSON.stringify(settings));
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
        for (var index in selectLanguage) {
            domBody = domBody.replace(index, selectLanguage[index]);
        }
        document.body.innerHTML = domBody;
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
        var hoja = document.createElement('style')
        hoja.innerHTML = "div {border: 2px solid black; background-color: blue;}";
        document.body.appendChild(hoja);
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
    console.log("moduifica DOM!");
    if (typeof localStorage.settings == 'string') {
        var Traslators = new Traslator(JSON.parse(localStorage.settings));
    }
});