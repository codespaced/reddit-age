// ==UserScript==
// @name     Inject Reddit User Age
// @version  1
// @match    https://old.reddit.com/*
// @require  https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js
// @grant    none
// ==/UserScript==

// orginal has 404'd https://github.com/Mothrakk/NRMT6
// forked from https://github.com/golf1052/reddit-age

// skip iframes
if (window.self!=window.top) {return}

// globals
const seenUsers = {};
const js_reddit_age = 'js_reddit_age'
const Now = moment();

function main() {
    const taglines = document.getElementsByClassName('tagline');
    for (let i = 0; i < taglines.length; i++) {
        const tagline = taglines[i];
        if (nodeInTagline(tagline)) {
            continue;
        }
        const authorTag = tagline.getElementsByClassName('author')[0];
        if (!authorTag) {
            continue;
        }
        const username = authorTag.innerHTML;
        if (username in seenUsers) {
            insertAfter(seenUsers[username].cloneNode(true), authorTag);
        } else {
            fetch(`https://reddit.com/user/${username}/about.json`)
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    const created_utc = data.data.created_utc;
                    createNode(username, created_utc);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }
}

function getAge(created){
    return moment(created * 1000);
}

function getYears(age){
    return Now.diff(age, 'years', true);
}

function colorByAge(age){
    const years = getYears(age);
    if (years < 0.35) {
        return 'red';
    }
    if (years < 1) {
        return 'orange';
    }
    if (years < 2) {
        return 'yellow';
    }
    if (years < 4) {
        return 'violet';
    }
    return 'green';
}

function textFromAge(age){
    return `${age.from(Now, true)} - ${age.format('ll')}`;
}

function createNode(username, created) {    
    const node = document.createElement('span');
    const age = getAge(created);
    let text = textFromAge(age);
    node.appendChild(document.createTextNode(text));    
    node.className = js_reddit_age;
    node.style.color = colorByAge(age);
        
    seenUsers[username] = node;
}

function nodeInTagline(tagline) {
    return tagline.getElementsByClassName(js_reddit_age).length > 0;
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

setInterval(main, 1000);
