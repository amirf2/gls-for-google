let jsonData = "";
const stepsData = {};

$.getJSON(
    "https://guidedlearning.oracle.com/player/latest/api/scenario/get/v_IlPvRLRWObwLnV5sTOaw/5szm2kaj/?callback=?",
    function (result) {
        jsonData = result;
        const { steps } = jsonData.data.structure;
        createStepsData(steps);
        createPopUpsForGoogle(steps);
    }
);

const content = `
    <p>Welcome to <em><strong>Google</strong></em>!</p>\n
    <div class="d-flex">
        <button class="btn btn-primary btn-xs p-2 mr-1  gls-font-size">Step Back</button>
        <button onClick="next('#amir')" class="btn btn-primary btn-xs p-2 mr-1  gls-font-size">Next</button>
    </div>
  `;

const title = `
    <div>
        <span class="d-flex">
        <span class="popover-title mr-5">GLS</span> 
            <button class="btn btn-secondary btn-xs p-2 ml-5 mr-2">Remind me later</button>
            <button onClick="closeMe('#amir')" class="btn btn-secondary btn-xs p-2">X</button>
        </span>
    </div>
    `;

function next(stepID) {
    const { selector } = stepsData[stepID];
    const nextID = stepsData[stepID].next;
    if (nextID) {
        const next = stepsData[nextID];
        $(selector).popover("hide");
        $(next.selector).popover("show");
    }
}

function prev(stepID) {
    console.log(`prev(stepID) is ${stepsData[stepID]}`);
    const { selector } = stepsData[stepID];
    const prevID = stepsData[stepID].prev;
    if (prevID) {
        const prev = stepsData[prevID];
        $(selector).popover("hide");
        $(prev.selector).popover("show");
    }
}

function closeMe(stepID) {
    const selector = stepsData[stepID].selector;
    if (selector) {
        $(selector).popover("hide");
    }
}

function createContent(selector, content = "content was not provied", stepID) {
    console.log(`createContent stepID : ${stepID}`);
    return `
                ${content["#content"]}
                <div class="d-flex">
                  <button onClick="prev(${stepID})" class="btn btn-primary btn-xs p-2 mr-1 gls-font-size">Step Back</button>
                  <button onClick="next(${stepID})" class="btn btn-primary btn-xs p-2 mr-1 gls-font-size">Next</button>
                </div>
                `;
}

function createTitle(selector, stepID) {
    return `
                <div>
                    <span class="d-flex">
                    <span class="popover-title mr-5">GLS</span> 
                        <button class="btn btn-secondary btn-xs p-2 ml-5 mr-2">Remind me later</button>
                        <button onClick="closeMe(${stepID})" class="btn btn-secondary btn-xs p-2">X</button>
                    </span>
                </div>
            `;
}

function jqueryFunc(selector, content, stepID) {
    console.log(`step id iss::  ${stepID}`);
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


function createPopUpsForGoogle(steps) {
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
    console.log("in createStepsData");
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
    console.log(stepsData);

}