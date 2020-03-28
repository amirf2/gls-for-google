let jsonData = "";
const stepsData = {};
const INTRO_AND_END_STEPS = 2;

/*--------------------------------------------------------------------
|               Event methods to handle popovers
*-------------------------------------------------------------------*/

const nextStep = stepID => {
    const { selector } = stepsData[stepID];
    const nextID = stepsData[stepID].next;
    if (nextID) {
        const next = stepsData[nextID];
        $(selector).popover("hide");
        $(next.selector).popover("show");
    }
}


const prevStep = stepID => {
    const { selector } = stepsData[stepID];
    const prevID = stepsData[stepID].prev;
    if (prevID) {
        const prev = stepsData[prevID];
        $(selector).popover("hide");
        $(prev.selector).popover("show");
    }
}


const closeStep = stepID => {
    const selector = stepsData[stepID].selector;
    if (selector) {
        $(selector).popover("hide");
    }
}


const init = () => {

/*-------------------------------------------------------------------
|              Loading Scripts And Fetch Data Methods
*-------------------------------------------------------------------*/

    const loadJs = filename => {
        var tag = document.createElement('script');
        tag.setAttribute("type", "text/javascript");
        tag.setAttribute("src", filename);
        document.getElementsByTagName("head")[0].appendChild(tag);
    }

    loadJs("https://code.jquery.com/jquery-3.4.1.min.js");


    const waitForJQueryInterval = setInterval(() => {
        if (typeof jQuery !== 'undefined') {
            $ = jQuery;
            $("head").append(popperScript);
            clearInterval(waitForJQueryInterval);
            waitForBootstrapToLoad();
        }
    }, 25);


    const waitForBootstrapToLoad = () => {
        const waitForBootStrapInterval = setInterval(() => {
            if (typeof Popper !== 'undefined') {
                $("head").append(scripts);
                clearInterval(waitForBootStrapInterval);
                fetchData();
            }
        }, 25);
    }


    const fetchData = () => {
        $.getJSON(guide, result => {
                jsonData = result;
                const { steps } = jsonData.data.structure;
                fixBug(steps);
                createStepsData(steps);
                createPopoversForGoogle(steps);
            }
        );
    }

    const fixBug = (steps) => {
        for (const step of steps){
            //Fix bug in JSON Data - selector return 2 elements instead of one so two popovers will open instead of one.
            if (step.action.selector === "input[value=\"Google Search\"]")
                step.action.selector="div.FPdoLc input.gNO89b";
        }
    }



/*-------------------------------------------------------------------
|              Creating Popovers and Content Methods
*-------------------------------------------------------------------*/


    const checkIfLastStep = stepID => {
        const {next} = stepsData[stepID];
        if (next && stepsData[next]) {
            return stepsData[next].type === "closeScenario";
        }
    }


    const createPopoversForGoogle = steps => {
        for (const step of steps) {
            if (step.action.type !== 'closeScenario') {
                const stepID = step.id;
                const { selector, contents, type, placement } = step.action;
                jqueryFunc(selector, contents, stepID, placement, true);
            }
        }
        createIntro();
        startGuide("#startStep");
    }


    const initStepObj = (id) =>{
        if (!stepsData[id])
            stepsData[id] = {};
    }


    const createStepsData = steps => {
        for (const [index, step] of steps.entries()) {
            const { selector , type} = step.action
            const next = step.followers.length === 1 ? step.followers[0].next : null;
            initStepObj(step.id);
            stepsData[step.id].next = next;
            stepsData[step.id].selector = selector;
            stepsData[step.id].type = type;
            stepsData[step.id].number = index + INTRO_AND_END_STEPS;
            initStepObj(next);
            stepsData[next].prev = step.id;
        }
    }


    createIntro = () => {
        const stepID = "startStep";
        const selector = "#startStep";
        const content = '<p>Click here to start the guide</p>'
        const placement = "right"
        const nextStepID = jsonData.data.structure.steps[0].id;
        $("body").append(introElement);
        stepsData["startStep"] = {
            prev: stepID,
            next: nextStepID,
            selector: selector,
            type: "intro",
            number: 1
        }
        stepsData[nextStepID].prev = "startStep"
        jqueryFunc(selector, content, stepID, placement, false, "focus");
    }


    const createContent = (selector, content, stepID) => {
        content = content["#content"] || content;
        const prevButton = stepID === "startStep" ? "" : `<button onClick="prevStep('${stepID}')" class="btn btn-primary btn-xs p-2 mr-1 gls-font-size">Step Back</button>`
        const nextButton = stepsData[stepID].next === "eol0" ? "" : `<button onClick="nextStep('${stepID}')" class="btn btn-primary btn-xs p-2 mr-1 gls-font-size">Next</button>`
        return `
                <div class="popover-content">
                ${content}
                </div>
                <div class="d-flex">
                  ${prevButton}
                  ${nextButton}
                  <p class="mt-1 mb-1 ml-auto">step ${stepsData[stepID].number} of ${Object.keys(stepsData).length - INTRO_AND_END_STEPS}</p>
                </div>
                `;
    }


    const createTitle = (selector, stepID) => {
        return `<div class="d-flex justify-content-between">
                    <span class="popover-title mr-5">GLS - Google.com</span> 
                        <button onClick="closeStep('${stepID}')" class="btn btn-secondary btn-xs p-2 justify-content-right">X</button>
                    </span>
                </div>`;
    }



    const jqueryFunc = (selector, content, stepID, placement, chooseSelector, trigger = "manual") => {
        $(function () {
            $(selector).popover({
                container: "body",
                html: true,
                animation: true,
                trigger: trigger,
                placement: placement,
                selector: chooseSelector ? selector : false,
                sanitize: false,
                content: createContent(selector, content, stepID),
                title: createTitle(selector, stepID)
            });
        });
    }


    const startGuide = selector => {
        setTimeout(function () {
            $(selector).popover("show");
        }, 100);
    }



/*------------------------------------------------------------------------------------------------------------------------------
|                                               Data And Scripts HTML Elements
*-----------------------------------------------------------------------------------------------------------------------------*/

    
    const guide = "https://guidedlearning.oracle.com/player/latest/api/scenario/get/v_IlPvRLRWObwLnV5sTOaw/5szm2kaj/?callback=?"

    const scripts = `<link href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" 
                        rel="stylesheet" 
                        integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" 
                        crossorigin="anonymous">
                    <script 
                        src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" 
                        integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" 
                        crossorigin="anonymous">
                    </script>
                    <script src="https://kit.fontawesome.com/4b7beec3c8.js" crossorigin="anonymous"></script>
                    <link rel="stylesheet" href="https://raw.githack.com/amirf2/gls-for-google/master/style.css"/>`;

    const popperScript = `<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" 
                            integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" 
                            crossorigin="anonymous">
                          </script>`;



    const introElement = `<div class="m-2 intro-step" style="position: absolute; cursor: pointer;">
                            <a tabindex="0" id="startStep"><i class="fas fa-info-circle fa-2x"></i></a>
                         </div>`;

}


init();



/*-----------------------------------------------------------------------------------------------
|                                         Testing
*-----------------------------------------------------------------------------------------------*/




const verifyTest = (test) => {
    let testPassed = true;
    const { steps } = jsonData.data.structure;
    for (const step of steps){
        const [selector, contents, nextStepID] = destructStep(step);
        if (contents){
            testPassed  = testPassed && test(selector, contents, step.id, steps, nextStepID);
        }
    }
    return testPassed;
}


const runTests = () => {
    const { steps } = jsonData.data.structure;
    let testsPassed = verifyTest(validateContent) && verifyTest(nextButtonTest) && verifyTest(closeButtonTest);
    if (testsPassed){
        console.log("All Tests Passed");
    } else {
        console.log("Testing Failed");
    }
}


const validateContent = (selector, contents) => {
    let testPassed = true;
    const innerText = $.parseHTML(contents)[0].innerText // get the text from the HTML string of the JSON step data
    $(selector).popover("hide");
    const beforelength = $(`.popover-content:contains(${innerText})`).length;
    $(selector).popover("show");
    const afterlength = $(`.popover-content:contains(${innerText})`).length;
    $(selector).popover("hide");
    if (afterlength === beforelength){
        testPassed=false;
    }
    return testPassed;
}


const nextButtonTest = (selector, contents, id, steps, nextStepID) => {
    const testPassed = true;
    let nextStepAppear = true;
    $(selector).popover("show");
    const nextStep = getStepByID(steps, nextStepID);
    if (nextStep){
        const [nextStepselector, nextStepcontents] = destructStep(nextStep);
        if (nextStepselector){
            $(nextStepselector).popover("hide");
            const nextButton = $(`button[onClick="nextStep('${id}')"]`);
            if (nextButton){
                nextButton.click();
                const nextStepInnerText = $.parseHTML(nextStepcontents)[0].innerText
                nextStepAppear = $(`.popover-content:contains(${nextStepInnerText})`).length > 0;
                $(nextStepselector).popover("hide");
            }
        }
    }
    $(selector).popover("hide");
    if (!nextStepAppear){
        testPassed=false;
    }
    return testPassed;
}

const closeButtonTest = async (selector, contents, id) => {
    let testPassed = true;
    $(selector).popover("show");
    const innerText = $.parseHTML(contents)[0].innerText // get the text from the HTML string of the JSON step data
    const beforelength = $(`.popover-content:contains(${innerText})`).length;
    const closeButton = $(`button[onClick="closeStep('${id}')"]`);
    closeButton.click();
    await sleep(100) // Wait for the animation of the popover to disappear 
    const afterlength = $(`.popover-content:contains(${innerText})`).length;
    if (afterlength === beforelength){
        testPassed=false;
    }
    return testPassed;
}


const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

  

const getStepByID = (steps, id) => {
    for (const step of steps){
        if (step.id===id)
            return step;
    }
}


const destructStep = (step) => {
    const {action, followers} = step;
    const {selector="", contents=""} = action;
    const extractContent = contents? contents["#content"] : contents;
    const {next=""} = followers.length>0? followers[0] : [];
    return [selector, extractContent, next];
}


