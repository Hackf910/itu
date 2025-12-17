let garaltinh = document.getElementById("garaltin-utga");
let buhTovch = document.getElementsByTagName("button");

let uildelC = document.getElementById("c");
let uldegteltei = document.getElementById("%");
let buhelHuvah = document.getElementById("/");
let Nemeh = document.getElementById("+");
let Hasah = document.getElementById("-");
let Urjih = document.getElementById("x");
let Tentsu = document.getElementById("=");

let odooUtga = "0";      // дэлгэц дээр харагдаж байгаа утга (string)
let huuchinUtga = null;  // өмнөх (first) тоо
let odooUildel = null;   // + - x / гэх мэт
let shineTooEhlee = false; // үйлдэл дараад дараагийн тоо эхлэх үед true болно

function delgetsShinechleh() {
    garaltinh.textContent = odooUtga;

    let urt = odooUtga.length;

    // үндсэн хэмжээ
    let anhniiSize = 60;

    if (urt > 8) {
        // тэмдэгт бүр нэмэгдэхэд 3px-аар багасгана
        let shineSize = anhniiSize - (urt - 8) * 3;

        // хамгийн багадаа 25px болгоё
        if (shineSize < 25) shineSize = 25;

        garaltinh.style.fontSize = shineSize + "px";
    } else {
        // 8-аас бага бол анхны хэмжээ рүү буцаана
        garaltinh.style.fontSize = anhniiSize + "px";
    }
}



// C товч – бүгдийг цэвэрлэх
function buhniig_tseverleh() {
    odooUtga = "0";
    huuchinUtga = null;
    odooUildel = null;
    shineTooEhlee = false;
    delgetsShinechleh();
}

// Товч бүрт click эвент өгнө
for (let i = 0; i < buhTovch.length; i++) {
    buhTovch[i].addEventListener("click", function () {
        let text = this.textContent;
        if (this.id === "c") {
            buhniig_tseverleh();
            return;
        }
        if (text === "=") {
            tootsooloh();
            odooUildel = null;
            shineTooEhlee = true;
            return;
        }
        if (text === "%") {
            let too = parseFloat(odooUtga);
            if (!isNaN(too)) {
                odooUtga = String(too / 100);
                delgetsShinechleh();
            }
            return;
        }
        if (text === "+" || text === "-" || text === "x" || text === "/") {
            uildelDaralt(text);
            return;
        }
        if (text === ".") {
            taslalDaralt();
            return;
        }
        tooDaralt(text);
    });
}

function tooDaralt(too) {
    // Хэрвээ шинээр тоо эхлэж байвал өмнөхийг арилгана
    if (odooUtga === "0" || shineTooEhlee) {
        odooUtga = too;
        shineTooEhlee = false;
    } else {
        odooUtga += too;
    }
    delgetsShinechleh();
}

function taslalDaralt() {
    if (shineTooEhlee) {
        // шинээр тоо эхлэх гэж байхад . дарвал "0." гэж эхлүүлье
        odooUtga = "0.";
        shineTooEhlee = false;
    } else if (!odooUtga.includes(".")) {
        odooUtga += ".";
    }
    delgetsShinechleh();
}

function uildelDaralt(temdeg) {
    let too = parseFloat(odooUtga);

    if (huuchinUtga === null) {
        huuchinUtga = too;
    } else if (!shineTooEhlee) {
        tootsooloh();
    }

    odooUildel = temdeg;
    shineTooEhlee = true;
}

function tootsooloh() {
    if (odooUildel === null || huuchinUtga === null) return;

    let odoogiinToo = parseFloat(odooUtga);
    if (isNaN(odoogiinToo)) return;

    let hariu = huuchinUtga;

    switch (odooUildel) {
        case "+":
            hariu = huuchinUtga + odoogiinToo;
            break;
        case "-":
            hariu = huuchinUtga - odoogiinToo;
            break;
        case "x":
            hariu = huuchinUtga * odoogiinToo;
            break;
        case "/":
            hariu = odoogiinToo === 0 ? "Error" : huuchinUtga / odoogiinToo;
            break;
    }

    odooUtga = String(hariu);
    huuchinUtga = (hariu === "Error") ? null : hariu;
    delgetsShinechleh();
}
