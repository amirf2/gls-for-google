let jsonData = "";
const stepsData = {};


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


    const loadJs = filename => {
        var tag = document.createElement('script');
        tag.setAttribute("type", "text/javascript");
        tag.setAttribute("src", filename);
        document.getElementsByTagName("head")[0].appendChild(tag);
    }

    const waitForJQuery = setInterval(() => {
        if (typeof jQuery !== 'undefined') {
            $ = jQuery;
            $("head").append(popperScript);
            clearInterval(waitForJQuery);
            waitForBootstrapScripts();
        }
    }, 25);

    const waitForBootstrapScripts = () => {
        const waitForBootStrapInterval = setInterval(() => {
            if (typeof Popper !== 'undefined') {
                $("head").append(scripts);
                clearInterval(waitForBootStrapInterval);
                fetchData();
            }
        }, 25);
    }


    const fetchData = () => {
        $.getJSON(
            "https://guidedlearning.oracle.com/player/latest/api/scenario/get/v_IlPvRLRWObwLnV5sTOaw/5szm2kaj/?callback=?",
            result => {
                jsonData = result;
                const { steps } = jsonData.data.structure;
                createStepsData(steps);
                createPopoversForGoogle(steps);
            }
        );
    }


    const checkIfLastStep = stepID => {
        const next = stepsData[stepID].next;
        if (next && stepsData[next]) {
            return stepsData[next].type === "closeScenario";
        }

    }

    const createContent = (selector, content, stepID) => {
        content = content["#content"] || content;
        //console.log(stepsData[stepID].next);
        const prevButton = stepID === "startStep" ? "" : `<button onClick="prevStep('${stepID}')" class="btn btn-primary btn-xs p-2 mr-1 gls-font-size">Step Back</button>`
        const nextButton = stepsData[stepID].next === "eol0" ? "" : `<button onClick="nextStep('${stepID}')" class="btn btn-primary btn-xs p-2 mr-1 gls-font-size">Next</button>`
        return `
                <div class="popover-content">
                ${content}
                </div>
                <div class="d-flex">
                  ${prevButton}
                  ${nextButton}
                  <p class="mt-1 mb-1 ml-auto">step ${stepsData[stepID].number} of ${Object.keys(stepsData).length - 1}</p>
                </div>
                `;
    }


    const createTitle = (selector, stepID) => {
        return `<div class="d-flex justify-content-between">
                    <span class="popover-title mr-5">GLS</span> 
                        <button onClick="closeStep('${stepID}')" class="btn btn-secondary btn-xs p-2 justify-content-right">X</button>
                    </span>
                </div>`;
    }


    const jqueryFunc = (selector, content, stepID, placement, chooseSelector, trigger = "manual") => {
        $(function () {
            $(selector).popover({
                container: "body",
                html: true,
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


    const createPopoversForGoogle = steps => {
        createIntro();
        for (const step of steps) {
            if (step.action.type !== 'closeScenario') {
                const stepID = step.id;
                const { selector, contents, type, placement } = step.action;
                jqueryFunc(selector, contents, stepID, placement, true);
            }
        }
        startGuide("#startStep");
    }


    const createStepsData = steps => {
        let prev = null;
        for (const [index, step] of steps.entries()) {
            const { selector } = step.action
            const next = step.followers.length === 1 ? step.followers[0].next : null;
            stepsData[step.id] = {
                prev: prev ? prev : null,
                next: next,
                selector: selector,
                type: step.action.type,
                number: index + 2
            }
            prev = step.id;
        }
        console.log(stepsData);
    }


    createIntro = () => {
        const stepID = "startStep";
        const selector = "#startStep";
        const content = '<p>Welcome To GLS for Google !</p>'
        const placement = "right"
        $("body").append(introElement);
        stepsData["startStep"] = {
            prev: stepID,
            next: jsonData.data.structure.steps[0].id,
            selector: selector,
            type: "intro",
            number: 1
        }
        jqueryFunc(selector, content, stepID, placement, false, "focus");
    }


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



    const introElement = `<div class="m-2 intro-step">
                            <a tabindex="0" id="startStep"><i class="fas fa-info-circle fa-2x"></i></a>
                         </div>`;


    loadJs("https://code.jquery.com/jquery-3.4.1.min.js");

}


init();