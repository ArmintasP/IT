const submissionIdPrefix = "sub-";
var submissionCount = 0;

// 0th element never will be accessed.
var submissionDeletedStates = [true];


function submissionFormSubmit(){
    var username = document.getElementById("username");
    var age = document.getElementById("age");
    var {year, month, day} = getDateElements();

    if (!formValidation(username, age, year, month, day))
        return false;

    username = username.value;
    age = parseInt(age.value);
    year = parseInt(year.value);
    month = parseInt(month.value);
    day = parseInt(day.value);

    var submission = createSubmission(username, age, year, month, day);

    if (document.getElementById("jsonblobsend").checked)
        sendJsonBlob(username, age, year, month, day);

    document
        .getElementById("submissions")
        .appendChild(submission);
    
    document
        .getElementById("submission-form")
        .reset(); 

    return false;
}

function displayFormSubmit(){
    var id = getSubmissionId("#submission-display");
    var submission = getSubmission(id);
    if (submission === null)
        return false;

    if (submission.css("display") == "none")
        submission.show();
    else
        submission.hide();

    $("#display-form").trigger("reset");
    return false;
}

function changeTextFormSubmit(){
    var id = getSubmissionId("#change-text-number")
    var submission = getSubmission(id);
    if (submission === null)
        return false;
   
    var newText = $("#change-text-newtext").val();
    submission.text(submissionOpening(id) + newText);

    $("#change-text-form").trigger("reset");
    return false;
}

function changeStyleFormSubmit(){
    var id = getSubmissionId("#change-style-number")
    var submission = getSubmission(id);
    if (submission === null)
        return false;

    var style = $("#change-style-style").val();
    submission.css("color", style);

    $("#change-style-form").trigger("reset");
    return false;
}

function deleteFormSubmit(){
    var id = getSubmissionId("#delete-number")
    var submission = getSubmission(id);
    if (submission === null)
        return false;

    submission.remove();
    submissionDeletedStates[id] = true;

    $("#delete-form").trigger("reset");
    return false;
}

function addFormSubmit(){
    increaseSubmissionCount();
    submissionDeletedStates.push(false);
    var text = submissionOpening(submissionCount) + $("#add-text").val();

    $("#submissions").append("<p id= \"" +submissionIdPrefix + submissionCount + "\">" + text + "</p>");

    $("#add-form").trigger("reset");
    return false;
}

function sendJsonBlob(username, age, year, month, day){
    const url = "https://jsonblob.com/api/jsonBlob";
    var data = {
        username: username,
        age: age,
        year: year,
        month: month,
        day: day
    };

    $.ajax(url, {
        data : JSON.stringify(data),
        contentType : "application/json",
        type : "POST",
        success: function(_, _, result) {
            var location = result.getResponseHeader("Location");
            saveBlobId(location);        
        }
    });
}

function getJsonBlob(blobId, button){
    const url = "https://jsonblob.com/api/jsonBlob/" + blobId;

    $.ajax(url, {
        contentType : "application/json",
        type : "GET",
        success: function(data) {
            button.remove();
            storeToTable(blobId, data);
        }
    });
}

function storeToTable(blobId, data){
    var row = $("td:contains(" + blobId + ")").parent();

    var username = $("<td>" + data.username + "</td>");
    var age = $("<td>" + data.age + "</td>");
    var date = $("<td>" + data.year + "-" + data.month + "-" + data.day + "</td>");

    row.append(username)
       .append(age)
       .append(date);
}


function saveBlobId(locationHeader){
    var blobId = locationHeader.split("/").pop();

    var button = $("<td>" + blobId + "<button type=\"button\" class=\"blobs\" onclick=\"getJsonBlob(&quot;"
        + blobId +"&quot;, this)\">Get Blob Data</button></td>");

    var row = $("<tr></tr>")
        .append(button);

    $("#table").append(row);
}

function getSubmission(id){
    if (id === null)
        return null;

    id = submissionIdPrefix + id;
    var submission =  $("#" + id);
    return submission;
}

function getSubmissionId(selector){
    var id = $(selector).val();

    if (!positiveNumberValidation(id)){
        alert("Must be a positive number.")
        return null;
    }
    id = parseInt(id);

    if (id < 1 || id > submissionCount || submissionDeletedStates[id]) {
        alert("Such paragraph does not exist.")
        return null;
    }

    return id;
}

function createSubmission(username, age, year, month, day){
    increaseSubmissionCount();
    submissionDeletedStates.push(false);

    var newSubmission = document.createElement("p");
    var text = submissionOpening(submissionCount) + username + " is " + age 
        + " years old. For some reason she or he likes " 
        + year + "-" + month + "-" + day + ", what a lame date to like.";
    
    newSubmission.appendChild(document.createTextNode(text));
    newSubmission.setAttribute("id", submissionIdPrefix + submissionCount)
    return newSubmission;
}

function increaseSubmissionCount() {
    submissionCount += 1;
    $("#submission-count").text(submissionCount);
}

function formValidation(username, age, year, month, day){
    var isValid = true;
    isValid = usernameValidation(username.value) && isValid;
    isValid = ageValidation(age.value) && isValid;
    isValid = dateValidation(year.value, month.value, day.value) && isValid;

    return isValid;
}

function usernameValidation(username){
    var regex = new RegExp("^[A-Za-z]+$");
    if (regex.test(username))
        return true;

    alert("The name was entered incorrectly. Username must include only alphabetic characters.")
    return false;
}

function ageValidation(age){
    if (positiveNumberValidation(age))
        return true;

    alert("Age must be a positive integer.")
    return false;
}

function positiveNumberValidation(num){
    return !isNaN(num) && parseInt(num) == num && !isNaN(parseInt(num, 10)) && num > 0;
}

function dateValidation(year, month, day){
    var invalid = false;
    if (!positiveNumberValidation(year)) {
        alert("Year must be a positive integer.")
        invalid = true;
    }
    if (!positiveNumberValidation(month)) {
        alert("Month must be a positive integer.")
        invalid = true;
    }
    if (!positiveNumberValidation(day)) {
        alert("Day must be a positive integer.")
        invalid = true;
    }
    if (invalid)
        return false;

    year = parseInt(year);
    month = parseInt(month) - 1;
    day = parseInt(day);

    if (month < 0 || month > 11) {
        alert("Month values can only be from 1 to 12.")
        return false;
    }
    var date = new Date(year, month, day);
    if (date.getDate() != day) {
        alert("Day number is invalid for the favourite month.");
        return false;
    }
    return true;
}

function getDateElements(){
    var year = document.getElementById("year");
    var month = document.getElementById("month");
    var day = document.getElementById("day");
    return {year, month, day};
}

function submissionOpening(id) {
    return "#" + id + ": ";
}