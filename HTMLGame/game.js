// const Springer = window.Springer.default;
// const spring = Springer(0.7, 0.8);

function a_lerp(st, en, t) {
    return (st + (en - st) * t);
}

function a_square(x) {
    return x * x;
}

function a_flip(x) {
    return 1 - x;
}

function a_easeIn(t) {
    return t * t;
}

function a_easeOut(t)
{
    return a_flip(a_square(a_flip(t)));
}

function a_easeInOut(t)
{
    return a_lerp(a_easeIn(t), a_easeOut(t), t);
}

function animFunction(t) {
    return a_easeInOut(t);
}

// GLOBAL HELPERS--------------------------------------------------------------

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const imageCached = [];
async function preload(name, url) {
    let texture = await PIXI.Assets.load(url);
    imageCached[name] = texture;
};

function image(name) {
    return imageCached[name];
};

function nSprite(imageName) {
    let newSprite = new PIXI.Sprite(image(imageName));
    newSprite.anchor.set(0.5);
    return newSprite;
};

function nText(string, size = 16, color = 0xff0000) {
    let newText = new PIXI.Text({
        text: string,
        style: {
            fontFamily: 'Verdana',
            fontSize: size,
            fill: color,
            align: 'center',
            fontWeight: 800
        }
    });
    newText.anchor.set(0.5);
    return newText;
};

function nTextDigit(string, size = 16, color = 0xff0000) {
    let newText = new PIXI.BitmapText({
        text: string,
        style: {
            fontFamily: 'E1234',
            fontSize: size,
            fill: color,
            align: 'center',
            fontWeight: 800
        }
    });
    newText.anchor.set(0.5);
    newText.tint = color;
    return newText;
};

function msSpeed(distance, second) {
    return distance / second / 1000;
}

function msFrom(startDate) {
    return new Date() - startDate;
}

PIXI.Sprite.prototype.xy = function xy(x, y) {
    this.x = x;
    this.y = y;
};

PIXI.Text.prototype.xy = function xy(x, y) {
    this.x = x;
    this.y = y;
};

PIXI.Container.prototype.xy = function xy(x, y) {
    this.x = x;
    this.y = y;
};

PIXI.Sprite.prototype.scl = function scl(newScale) {
    this.scale.x = newScale;
    this.scale.y = newScale;
};

PIXI.Text.prototype.scl = function scl(newScale) {
    this.scale.x = newScale;
    this.scale.y = newScale;
};

PIXI.Container.prototype.scl = function scl(newScale) {
    this.scale.x = newScale;
    this.scale.y = newScale;
};

PIXI.Sprite.prototype.reset = function reset(visible = true) {
    this.alpha = 1.0;
    this.scale.x = 1.0;
    this.scale.y = 1.0;
    this.visible = visible;
};

PIXI.Text.prototype.reset = function reset(visible = true) {
    this.alpha = 1.0;
    this.scale.x = 1.0;
    this.scale.y = 1.0;
    this.visible = visible;
};

PIXI.Container.prototype.reset = function reset(visible = true) {
    this.alpha = 1.0;
    this.scale.x = 1.0;
    this.scale.y = 1.0;
    this.visible = visible;
};

PIXI.Text.prototype.update = function update(newText) {
    this.text = newText;
};

PIXI.BitmapText.prototype.update = function update(newText) {
    this.text = newText;
};

// LOCAL HELPERS---------------------------------------------------------------

const EnumGameState = {
    Ready: 0,
    Scan: 1,
    Pump: 2,
    Save: 3,
    Over: 4
}

var globalTicker = null;
var globalStage = null;
var globalLogger = null;
var screenW = null;
var screenH = null;
var centerX = null;
var centerY = null;

function log(any) {
    let displayText = any;
    globalLogger.update(displayText);
    globalLogger.visible = true;
}

function add(newObj, x = centerX, y = centerY) {
    newObj.x = x;
    newObj.y = y;
    globalStage.addChild(newObj);
}

function remove(obj) {
    globalStage.removeChild(obj);
}

function addSpriteFrom(imageName, x = centerX, y = centerY) {
    let newObj = nSprite(imageName);
    add(newObj, x, y);
    return newObj;
}

function addText(string, size = 16, color = 0xff0000, x = centerX, y = centerY) {
    let newText = nText(string, size, color);
    add(newText, x, y);
    return newText;
}

function addTextDigit(string, size = 16, color = 0xff0000, x = centerX, y = centerY) {
    let newText = nTextDigit(string, size, color);
    add(newText, x, y);
    return newText;
}

function createGradientFilledRect(colorStops, x, y, w, h, vertical = true) {
    let gradientFill = new PIXI.FillGradient(0, 0, 0, h);
    colorStops.forEach((number, index) =>
    {
        let ratio = index / colorStops.length;
        gradientFill.addColorStop(ratio, number);
    });
    return new PIXI.Graphics().roundRect(x, y, w, h, 0).fill(gradientFill);
}

// ANIMATIONS------------------------------------------------------------------

function wait(duration, completion = null) {
    let msDuration = duration * 1000;
    var timing = 0;
    let onTick = (ticker) => {
        timing += ticker.deltaMS;
        if (timing >= msDuration){
            globalTicker.remove(onTick);
            if (completion !== null) {
                completion();
            }
        }
    }
    globalTicker.add(onTick);
}

function animFade(obj, duration, start = 0, end = 1, completion = null) {
    obj.alpha = start;
    let msDuration = duration * 1000;
    if (start == end) { return; }
    var timing = 0;
    let onTick = (ticker) => {
        timing += ticker.deltaMS;
        obj.alpha = start + (end - start) * animFunction(timing / msDuration);
        if (timing >= msDuration){
            obj.alpha = end;
            globalTicker.remove(onTick);
            if (completion !== null) {
                completion();
            }
        }
    }
    globalTicker.add(onTick);
}

function animScale(obj, duration, start = 0, end = 1, completion = null) {
    obj.scale.x = start;
    obj.scale.y = start;
    let msDuration = duration * 1000;
    if (start == end) { return; }
    var timing = 0;
    let onTick = (ticker) => {
        timing += ticker.deltaMS;
        obj.scale.x = start + (end - start) * animFunction(timing / msDuration);
        obj.scale.y = start + (end - start) * animFunction(timing / msDuration);
        if (timing >= msDuration){
            obj.scale.x = end;
            obj.scale.y = end;
            globalTicker.remove(onTick);
            if (completion !== null) {
                completion();
            }
        }
    }
    globalTicker.add(onTick);
}

function animMove(obj, duration, endX, endY, relative = false, completion = null) {
    let startX = obj.x;
    let startY = obj.y;
    let msDuration = duration * 1000;
    if (startX == endX && startY == endY) { return; }
    var timing = 0;
    let onTick = (ticker) => {
        timing += ticker.deltaMS;
        if (relative == true) {
            obj.x = startX + endX * animFunction(timing / msDuration);
            obj.y = startY + endY * animFunction(timing / msDuration);
        } else {
            obj.x = startX + (endX - startX) * animFunction(timing / msDuration);
            obj.y = startY + (endY - startY) * animFunction(timing / msDuration);
        }
        if (timing >= msDuration){
            globalTicker.remove(onTick);
            if (completion !== null) {
                completion();
            }
        }
    }
    globalTicker.add(onTick);
}

function flashScreen() {
    let rectangle = PIXI.Sprite.from(PIXI.Texture.WHITE);
    rectangle.width = screenW;
    rectangle.height = screenH;
    add(rectangle, 0, 0);
    animFade(rectangle, 0.1, 1.0, 0.0, () => {
        remove(rectangle);
    });
}

function popText(text, x, y, inDur = 0.2, stayDur = 3.0, outDur = 0.2) {
    let style = new PIXI.TextStyle({
        dropShadow: true,
        dropShadowAlpha: 0.2,
        dropShadowAngle: 1.57,
        dropShadowBlur: 6,
        dropShadowDistance: 4,
        fontFamily: 'monospace',
        fontSize: 32,
        fill: "#00ccff",
        align: 'center',
        fontWeight: 800
    });
    let toShowText = new PIXI.Text({
        text: text, style: style 
    });
    toShowText.anchor.set(0.5);
    add(toShowText, x, y)
    animFade(toShowText, inDur);
    animMove(toShowText, inDur, 0, -20, true, () => {
        wait(stayDur, () => {
            animFade(toShowText, outDur, 1.0 , 0.0);
            animMove(toShowText, inDur, 0, -20, true);
        })
    });
}

// MAIN APP--------------------------------------------------------------------

(async () => {
    const app = new PIXI.Application();
    var gameW = window.innerWidth;
    var gameH = window.innerHeight;
    const minW = 320.0;
    const minH = 568.0;
    if ((gameW < minW) || (gameH < minH)) {
        gameW = minW;
        gameH = minH;
    } else {
        const ratio = gameW / gameH;
        const expectedRatio = minW/minH;
        if (ratio > expectedRatio) {
            const scl = gameH / minH;
            gameW = scl * minW;
        } else {
            const scl = gameW / minW;
            gameH = scl * minH;
        }
    }
    await app.init({
        width: gameW,
        height: gameH,
        backgroundColor: 0x0d1b2a,
        antialias: true
    })
    document.body.appendChild(app.canvas);
    app.stage.sortableChildren = true;

    // SETUP GAME ASSETS-------------------------------------------------------

    await PIXI.Assets.load('E1234.xml');

    globalStage = app.stage;
    globalTicker = app.ticker;
    screenW = app.renderer.width;
    screenH = app.renderer.height;
    centerX = screenW / 2;
    centerY = screenH / 2;

    const logText = addText('DEBUG', 16);
    logText.zIndex = 1;
    logText.y = screenH - 200;
    globalLogger = logText;
    logText.visible = false;

    await preload('fuel','fuel_pump.png');
    await preload('phone','mobile_phone.png');
    await preload('car1','car1.png');
    await preload('car2','car2.png');
    await preload('car3','car3.png');
    await preload('car4','car4.png');
    await preload('car5','car5.png');
    await preload('adPole1','adPole1.png');
    await preload('adPole2','adPole2.png');
    await preload('plate','plate.png');

    // SETUP GAME STATE--------------------------------------------------------

    var gameState = EnumGameState.Ready;
    var state = 0;
    var stateCounter = 0;
    var stateStartedDate = new Date();
    var pumpScore = 0.0;

    // SETUP GAME OBJS---------------------------------------------------------

    const pumpTextToPumpHRatio = 0.3;
    const pumpContainer = new PIXI.Container();

    const floorBg = createGradientFilledRect([0x03045e, 0x023e8a], - screenW / 2.0, 0, screenW, screenH / 2.0);
    pumpContainer.addChild(floorBg);

    const adPole1 = nSprite('adPole1');
    adPole1.anchor.y = 1.0;
    adPole1.scl(screenW * 0.4 / adPole1.width);
    adPole1.alpha = 0.2;
    pumpContainer.addChild(adPole1);

    const adPole2 = nSprite('adPole2');
    adPole2.anchor.y = 1.0;
    adPole2.scl(screenW * 0.4 / adPole2.width);
    adPole2.alpha = 0.2;
    pumpContainer.addChild(adPole2);

    const pump = nSprite('fuel');
    pumpContainer.addChild(pump);

    var car = nSprite('car' + (1 + getRandomInt(5)));
    car.anchor.x = 0.0;
    car.anchor.y = 0.8;
    car.scl(3);
    pumpContainer.addChild(car);

    const pumpText = nTextDigit('00.00', 64, 0x000000);
    pumpContainer.addChild(pumpText);
    pumpText.xy(0, -pump.height * pumpTextToPumpHRatio);
    pumpText.scl(0.5);

    add(pumpContainer, 0, 0);

    const startPumpW = screenW * 0.8;
    const startPumpH = pump.height * startPumpW / pump.width;
    const startPumpScale = startPumpW / pump.width;
    const finalPumpW = screenW * 1.8;
    const finalPumpH = pump.height * finalPumpW / pump.width;
    const finalPumpScale = finalPumpW / pump.width;

    var negScale = 1.0 / startPumpScale;
    floorBg.scale.x = negScale;
    floorBg.scale.y = negScale;
    const poleGap = 0.45;
    adPole1.x = -screenW * poleGap * negScale;
    adPole2.x = screenW * poleGap * negScale;
    car.x = screenW * negScale / 2.0;
    const endCarX = -car.width - (screenW * negScale / 2.0 );

    const phone = new PIXI.Container();
    const realPhone = nSprite('phone');
    const realPhoneWidth = realPhone.width;
    const phoneScl = screenW * 0.5 / realPhoneWidth;
    realPhone.scl(phoneScl);
    phone.addChild(realPhone);
    
    const phoneScreenW = realPhoneWidth;
    const phoneScreenH = phoneScreenW * 1.05;
    const phoneScreen = new PIXI.Container();
    phoneScreen.scl(phoneScl);
    const phoneScreenBg = createGradientFilledRect([0x495057, 0x343a40], -phoneScreenW / 2.0, -phoneScreenH / 2.0, phoneScreenW, phoneScreenH);
    phoneScreen.addChild(phoneScreenBg);
    const plate = nSprite('plate');
    plate.scl(0.3);
    phoneScreen.addChild(plate);

    const saveTextFontSize = 26;
    const saveTextGap = 34.0;
    const rectW = 30;
    const rectH = 46;
    const singleText = nTextDigit('8', saveTextFontSize, 0xffffff);
    const lastText = ['s','a','v','e']
    var saveTextsCounter = [];
    var saveTexts = [];

    for (let i = 0; i < 4; i++) {
        let saveTextContainer = new PIXI.Container();
        let saveText = nTextDigit(' \n1\n2\n3\n4\n5\n6\n7\n8\n9\n \n1', saveTextFontSize, 0x000000);
        saveText.anchor.y = 0.0;
        saveText.xy((saveTextGap / 2.0) - (saveTextGap * 2.0) + (i * saveTextGap),0);
        saveTextContainer.addChild(saveText);
        let saveTextGold = nTextDigit(lastText[i] + '\n-\n-\n-\n-\n-\n-\n-\n-\n-\n' + lastText[i] + '\n-', saveTextFontSize, 0xfca311);
        saveTextGold.anchor.y = 0.0;
        saveTextGold.x = saveText.x;
        saveTextContainer.addChild(saveTextGold);
        let saveTextRect = new PIXI.Graphics().roundRect(-rectW/2.0,-rectH/2.0, rectW, rectH, 2).fill(0x000000);
        saveTextRect.x = saveText.x;
        phoneScreen.addChild(saveTextRect);
        saveTextContainer.mask = saveTextRect;
        saveTextsCounter[i] = 0.0;
        saveTexts[i] = saveTextContainer;
        phoneScreen.addChild(saveTextContainer);
    }
    phone.addChild(phoneScreen);

    function updateSaveText(idx, deltaMS) {
        saveTextsCounter[idx] += deltaMS/1000.0;
        if (saveTextsCounter[idx] < 0.0) {
            saveTextsCounter[idx] += 10.0;
        }
        if (saveTextsCounter[idx] > 10.0) {
            saveTextsCounter[idx] -= 10.0;
        }
        rollSaveText(idx, saveTextsCounter[idx]);
    }

    function rollSaveText(idx, value) {
        saveTextsCounter[idx] = value;
        saveTexts[idx].y = -((1.5 + value) * singleText.height);
    }

    const dimBg = createGradientFilledRect([0x343434, 0x121212], -screenW/2.0, -screenH/2.0, screenW, screenH);
    add(dimBg);
    add(phone, 0, 0);

    dimBg.alpha = 0.0;
    phoneScreen.alpha = 0.0;

    const scoreText = addText('SCORE', 48, 0x00b4d8, centerX, gameH - 96);
    animFade(scoreText, 1.0, 0, 1);
    animScale(scoreText, 1.0, 0.5, 1.0);
    const scoreTable = {
        Scan: null,
        Pump: null,
        Save: null
    };
    function resetScoreText() {
        scoreTable.Scan = null;
        scoreTable.Pump = null;
        scoreTable.Save = null;
        updateScoreTextDisplay();
    }
    function updateScoreText(setForGameState, score){
        let setScore = Math.max(Math.min(score, 100.0), 0.0)
        if (setForGameState == EnumGameState.Scan) {
            scoreTable.Scan = score;
        } else if (setForGameState == EnumGameState.Pump) {
            scoreTable.Pump = score;
        } else if (setForGameState == EnumGameState.Save) {
            scoreTable.Save = score;
        }
        updateScoreTextDisplay()
    }
    function updateScoreTextDisplay() {
        var display = '';
        if (scoreTable.Scan != null) {
            display = display + 'Scan:' + scoreTable.Scan.toFixed(2)
        }
        if (scoreTable.Pump != null) {
            display = display + '\n' + 'Pump:' + scoreTable.Pump.toFixed(2)
        }
        if (scoreTable.Save != null) {
            display = display + '\n' + 'Save:' + scoreTable.Save.toFixed(2)
        }
        scoreText.update(display)
    }

    // STATES HELPER-----------------------------------------------------------

    function setGameState(newState) {
        gameState = newState;
        state = 0;
        stateCounter = 0;
        stateStartedDate = new Date();
        if (gameState === EnumGameState.Ready) { setupReady(); }
        else if (gameState === EnumGameState.Scan) { setupScan(); }
        else if (gameState === EnumGameState.Pump) { setupPump(); }
        else if (gameState === EnumGameState.Save) { setupSave(); }
        else if (gameState === EnumGameState.Over) { setupOver(); }
    }

    function setState(newState, resetDate = false) {
        state = newState;
        stateCounter = 0;
        if (resetDate) {
            stateStartedDate = new Date();
        }
    }
    
    // STATES FUNC-------------------------------------------------------------
    
    function setupReady() {
        phone.visible = false;
        dimBg.alpha = 0.0;
        phoneScreen.alpha = 0.0;

        scoreText.update('Tap to start');
        pumpContainer.scl(startPumpScale);
        pumpContainer.xy(centerX, centerY);
        pumpText.update('00.00');
        pumpText.alpha = 0.1;

        pumpContainer.removeChild(car);
        car = nSprite('car' + (1 + getRandomInt(5)));
        car.anchor.x = 0.0;
        car.anchor.y = 0.6;
        car.scl(3.2);
        car.x = screenW / 2.0;
        pumpContainer.addChild(car);
        animMove(car, 1.0, -screenW / 2.3, 0, true);
    }
    function tickerReady(deltaMS) {

    }
    function tapReady(x, y) {
        setGameState(EnumGameState.Scan);
    }

    function setupScan() {
        phone.reset();
        phone.xy(centerX, screenH - phone.height / 2.0);

        resetScoreText();
        animScale(phone, 0.5, 1.1, 1.0);
        animFade(phone, 0.5, 0, 1.0);
        popText('Tap when QR code aligned!', centerX, screenH * 0.1, 0.3, 3.0, 0.3);
    }
    function tickerScan(deltaMS) {
        if (state == 0) {
            if (stateCounter > 2000.0) {
                setState(1, true);
            }
            return;
        }
        if (state == 1) {
            const newPhoneY = phone.y - deltaMS * msSpeed(screenH - phone.height, 3);
            if (newPhoneY >= phone.height / 2.0) {
                phone.y = newPhoneY;
            } else {
                setState(2);
                updateScoreText(gameState, 0);
                flashScreen();
            }
            return;
        }
        if (state == 3) {
            if (stateCounter > 1000.0) {
                setGameState(EnumGameState.Pump)
            }
            return;
        }
    }
    function tapScan(x, y) {
        if (state == 0) {
            return;
        }
        if (state == 1) {
            var timeTap = Math.abs(stateCounter - 1500.0);
            setState(2);
            if (timeTap > 200.0) {
                timeTap = 200.0;
            }
            let scanScore = (200.0 - timeTap) / 2.0;
            updateScoreText(gameState, scanScore);
            flashScreen();
            return;
        }
        if (state == 2) {
            setState(3);
            animScale(phone, 0.2, 1.0, 1.1);
            animFade(phone, 0.2, 1.0, 0.0);
            return;
        }
    }

    function setupPump() {
        phone.alpha = 0;
        pumpContainer.reset();
        animScale(pumpContainer, 2.0, startPumpScale, finalPumpScale);
        animMove(pumpContainer, 2.0, 0, pumpTextToPumpHRatio * finalPumpH, true);
        pumpText.update('00.00');
        wait(2.0, () => {
            state = 1;
            animFade(pumpText, 0.2, pumpText.alpha, 1.0);
            popText('Press to start pumping.\nRelease at exactly $50.00', centerX, screenH * 0.1, 0.3, 5.0, 0.3);
        });

        pumpScore = 0.0;
    }
    function tickerPump(deltaMS) {
        if (state == 2) {
            pumpScore += deltaMS;
            if (pumpScore > 6000) {
                setState(3);
                pumpScore = 6000;
                updateScoreText(gameState, 0);
                flashScreen();
            }

            var myformat = new Intl.NumberFormat('en-US', {
                minimumIntegerDigits: 2,
                maximumIntegerDigits: 2,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            let displayNumber = myformat.format(pumpScore/100.0);
            pumpText.update(displayNumber);
            return;
        }
    }
    function tapPump(x, y) {
        if (state == 1) {
            setState(2);
            return;
        }
        if (state == 3) {
            setGameState(EnumGameState.Save)
            return;
        }
    }
    function tapUpPump(x, y) {
        if (state == 2) {
            setState(3);
            flashScreen();
            if (Math.abs(50.0 - pumpScore/100.0) > 10.0) {
                updateScoreText(gameState, 0);
            } else {
                let finalPumpScore = 100.0 - (Math.abs(50.0 - pumpScore/100.0) * 10.0);
                updateScoreText(gameState, finalPumpScore);
            }
            return;
        }
    }

    function setupSave() {
        phone.reset();
        phone.xy(centerX, centerY);
        phoneScreen.alpha = 1.0;
        animScale(phone, 1.0, phoneScl, 2.0);
        animFade(phone, 1.0, 0.0, 1.0);
        animFade(dimBg, 0.5, 0.0, 0.8);

        rollSaveText(0, 0.0);
        rollSaveText(1, 0.0);
        rollSaveText(2, 0.0);
        rollSaveText(3, 0.0);

        popText('Tap when\nthe Text shows SAVE', centerX, screenH * 0.1, 0.3, 3.0, 0.3);
    }
    function tickerSave(deltaMS) {
        if (state == 0 && stateCounter > 1000.0) {
            setState(1);
        } else if (state == 1) {
            let current = 0
            updateSaveText(current, deltaMS * 3.0);
            if (saveTextsCounter[current] >= 9) {
                setState(current + 2);
            }
        } else if (state == 2) {
            let current = 1
            updateSaveText(current, deltaMS * 3.0);
            if (saveTextsCounter[current] >= 9) {
                setState(current + 2);
            }
        } else if (state == 3) {
            let current = 2
            updateSaveText(current, deltaMS * 3.0);
            if (saveTextsCounter[current] >= 9) {
                setState(current + 2);
            }
        } else if (state == 4) {
            updateSaveText(3, deltaMS * 3.0);
        } else if (state == 5) {

        }
    }
    function tapSave(x, y) {
        if (state == 4) {
            flashScreen()
            let saveScore = 100.0 - Math.abs(9.0 - saveTextsCounter[3]) * 5.0
            updateScoreText(gameState, saveScore);
            setState(5)
        } else if (state == 5) {
            setGameState(EnumGameState.Over)
        }
    }
    
    function setupOver() {
        animFade(dimBg, 0.5, dimBg.alpha, 0.0);
        animFade(phone, 0.5, 1.0, 0.0);
        animScale(phone, 0.5, phone.scale, phoneScl);
        animScale(pumpContainer, 2.0, finalPumpScale, startPumpScale);
        animMove(pumpContainer, 2.0, 0, -pumpTextToPumpHRatio * finalPumpH, true);
        wait(1.0, () => {
            animMove(car, 2.0, endCarX, 0);
            animFade(pumpText, 0.2, 1.0, 0.1);
            pumpText.update('00.00');
        })
    }
    function tickerOver(deltaMS) {
        
    }
    function tapOver(x, y) {
        if (stateCounter > 3000) {
            setGameState(EnumGameState.Ready);
        }
    }

    // CORE--------------------------------------------------------------------

    setGameState(EnumGameState.Ready);
    // Listen for animate update
    app.ticker.add(function(ticker) {
        stateCounter += ticker.deltaMS;
        if (gameState === EnumGameState.Ready) { tickerReady(ticker.deltaMS); }
        else if (gameState === EnumGameState.Scan) { tickerScan(ticker.deltaMS); }
        else if (gameState === EnumGameState.Pump) { tickerPump(ticker.deltaMS); }
        else if (gameState === EnumGameState.Save) { tickerSave(ticker.deltaMS); }
        else if (gameState === EnumGameState.Over) { tickerOver(ticker.deltaMS); }
    });

    // Enable touch!
    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;
    app.stage.addEventListener('pointerdown', (e) => {
        if (gameState === EnumGameState.Ready) { tapReady(e.global.x, e.global.y); }
        else if (gameState === EnumGameState.Scan) { tapScan(e.global.x, e.global.y); }
        else if (gameState === EnumGameState.Pump) { tapPump(e.global.x, e.global.y); }
        else if (gameState === EnumGameState.Save) { tapSave(e.global.x, e.global.y); }
        else if (gameState === EnumGameState.Over) { tapOver(e.global.x, e.global.y); }
    });
    app.stage.addEventListener('pointerup', (e) => {
        if (gameState === EnumGameState.Pump) { tapUpPump(e.global.x, e.global.y); }
    });

})();
