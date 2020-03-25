
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
            ></script>
            <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" 
                rel="stylesheet" 
                integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" 
                crossorigin="anonymous"
            >
            <script 
                src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" 
                integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" 
                crossorigin="anonymous"
            ></script>`);
            clearInterval(waitForJQuery);
            fetchData();
        }
    }, 50);



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




    function createContent(selector, content = "content was not provied", stepID) {
        return `
                ${content["#content"]}
                <div class="d-flex">
                  <button onClick="prevStep(${stepID})" class="btn btn-primary btn-xs p-2 mr-1 gls-font-size">Step Back</button>
                  <button onClick="nextStep(${stepID})" class="btn btn-primary btn-xs p-2 mr-1 gls-font-size">Next</button>
                </div>
                `;
    }

    function createTitle(selector, stepID) {
        return `
                <div>
                    <span class="d-flex">
                    <span class="popover-title mr-5">GLS</span> 
                        <button class="btn btn-secondary btn-xs p-2 ml-5 mr-2">Remind me later</button>
                        <button onClick="closeStep(${stepID})" class="btn btn-secondary btn-xs p-2">X</button>
                    </span>
                </div>
            `;
    }

    function jqueryFunc(selector, content, stepID) {
        $(function () {
            $(selector).popover({
                container: "body",
                html: true,
                trigger: "manual",
                placement: "bottom",
                sanitize: false,
                content: createContent(selector, content, stepID),
                title: createTitle(selector, stepID)
            });
        });
        setPopOver(selector);
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
        for (let i = 0; i < steps.length - 1; i++) {
            const stepID = steps[i].id;
            const { selector, contents, type } = steps[i].action;

            jqueryFunc(selector, contents, stepID);
            if (type != "closeScenario") {
            }
        }
        startGuide(steps[0].action.selector);


    }


    function createStepsData(steps) {
        //console.log("in createStepsData");
        let prev = null;
        for (const step of steps) {
            if (step.action.type === "closeScenario")
                break;
            const { selector } = step.action
            const next = step.followers.length === 1 ? step.followers[0].next : null;
            stepsData[step.id] = {
                prev: prev ? prev : null,
                next: next,
                selector: selector
            }
            prev = step.id;
        }
        //console.log(stepsData);

    }


}

init();