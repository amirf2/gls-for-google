
let jsonData = "";
const stepsData = {};


function nextStep(stepID) {
    const { selector } = stepsData[stepID];
    const nextID = stepsData[stepID].next;
    if (nextID) {
        const next = stepsData[nextID];
        $(selector).popover("hide");
        $(next.selector).popover("show");
    }
}

function prevStep(stepID) {
    const { selector } = stepsData[stepID];
    const prevID = stepsData[stepID].prev;
    if (prevID) {
        const prev = stepsData[prevID];
        $(selector).popover("hide");
        $(prev.selector).popover("show");
    }
}

function closeStep(stepID) {
    const selector = stepsData[stepID].selector;
    if (selector) {
        $(selector).popover("hide");
    }
}


function loadJs(filename) {
    var tag = document.createElement('script');
    tag.setAttribute("type", "text/javascript");
    tag.setAttribute("src", filename);
    document.getElementsByTagName("head")[0].appendChild(tag);
}



function init() {


    loadJs("https://code.jquery.com/jquery-3.4.1.min.js");

    var waitForJQuery = setInterval(function () {
        if (typeof jQuery != 'undefined') {
            $ = jQuery;
            $("head").append(`
            <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" 
                integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" 
                crossorigin="anonymous"
            ></script>`);
            clearInterval(waitForJQuery);
            waitForBootstrap();
        }
    }, 50);

    function waitForBootstrap() {
        const waitForBootStrapInterval = setInterval(function () {
            if (typeof Popper !== 'undefined') {
                $("head").append(`
                            <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" 
                                rel="stylesheet" 
                                integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" 
                                crossorigin="anonymous"
                            >
                            <script 
                                src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" 
                                integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" 
                                crossorigin="anonymous"
                            ></script>
                            <script src="https://kit.fontawesome.com/4b7beec3c8.js" crossorigin="anonymous"></script>
                            <link rel="stylesheet" 
                                href="https://raw.githack.com/amirf2/gls-for-google/master/style.css"
                             />
                `);
                clearInterval(waitForBootStrapInterval);
                fetchData();
            }
        }, 50);
    }




    function fetchData() {
        $.getJSON(
            "https://guidedlearning.oracle.com/player/latest/api/scenario/get/v_IlPvRLRWObwLnV5sTOaw/5szm2kaj/?callback=?",
            function (result) {
                jsonData = result;
                const { steps } = jsonData.data.structure;
                createStepsData(steps);
                createPopoversForGoogle(steps);
            }
        );
    }


    function checkIfLastStep(stepID) {

        const next = stepsData[stepID].next;
        if (next && stepsData[next]) {
            console.log(stepsData[next]);
            return stepsData[next].type === "closeScenario";
        }

    }


    function createContent(selector, content, stepID) {
        content = content["#content"] || content;
        console.log(stepsData[stepID].next);
        const prevButton = stepID === "startStep" ? "" : `<button onClick="prevStep('${stepID}')" class="btn btn-primary btn-xs p-2 mr-1 gls-font-size">Step Back</button>`
        const nextButton = stepsData[stepID].next === "eol0" ? "" : `<button onClick="nextStep('${stepID}')" class="btn btn-primary btn-xs p-2 mr-1 gls-font-size">Next</button>`
        return `
                ${content}
                <div class="d-flex">
                  ${prevButton}
                  ${nextButton}
                </div>
                `;
    }

    function createTitle(selector, stepID) {
        return `
                <div class="d-flex justify-content-between">
                    <span class="popover-title mr-5">GLS</span> 
                        <button onClick="closeStep('${stepID}')" class="btn btn-secondary btn-xs p-2 justify-content-right">X</button>
                    </span>
                </div>
            `;
    }

    function jqueryFunc(selector, content, stepID, placement, chooseSelector, trigger = "manual") {
        console.log(trigger);
        console.log("jqueryFunc: ", selector, stepID, placement, chooseSelector);
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

    function setPopOver(selector) {
        $(selector)
            .on("mouseenter", function () {
                $(selector).popover("show");
                $(".popover").on("mouseleave", function () {
                    $(selector).popover("hide");
                });
            })
            .on("mouseleave", function () {
                setTimeout(function () {
                    if (!$(".popover:hover").length) {
                        $(selector).popover("hide");
                    }
                }, 300);
            });
    }

    function startGuide(selector) {
        setTimeout(function () {
            $(selector).popover("show");
        }, 100);
    }


    function createPopoversForGoogle(steps) {
        createIntro();
        for (let i = 0; i < steps.length - 1; i++) {
            const stepID = steps[i].id;
            const { selector, contents, type, placement } = steps[i].action;
            jqueryFunc(selector, contents, stepID, placement, true);
        }
        startGuide("#startStep");
    }


    function createStepsData(steps) {
        //console.log("in createStepsData");
        let prev = null;
        for (const step of steps) {
            const { selector } = step.action
            const next = step.followers.length === 1 ? step.followers[0].next : null;
            stepsData[step.id] = {
                prev: prev ? prev : null,
                next: next,
                selector: selector,
                type: step.action.type
            }
            prev = step.id;
        }
        console.log(stepsData);
    }

    function createIntro() {
        const stepID = "startStep";
        const selector = "#startStep";
        const content = '<p>Welcome To GLS for Google !</p>'
        const placement = "right"
        $("body").append(`
            <div style="position: absolute;">
            <a tabindex="0" id="startStep"><i class="fas fa-info-circle fa-2x"></i></a>
            </div>`
        );
        stepsData["startStep"] = {
            prev: stepID,
            next: jsonData.data.structure.steps[0].id,
            selector: selector,
            type: "intro"
        }
        jqueryFunc(selector, content, stepID, placement, false, "focus");
    }

}

init();