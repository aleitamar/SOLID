﻿
function pagePrep() {

    $.ajax({
        url: '/Mission/Index',
        success: function (data) {
            var map = $('.terrainMap');
            for (var rowIndex = data.map.length - 1; rowIndex >= 0; rowIndex--) {
                var row = data.map[rowIndex];
                for (var columnIndex = 0; columnIndex < row.length; columnIndex++) {
                    var id = columnIndex + "_" + rowIndex;
                    var imagePath = "/Images/" + row[columnIndex];
                    map.append('<img id="' + id + '" class="mapImage" src="' + imagePath + '" alt="Image" />');
                }
            }
        }
    });

    $(".terrainMap").on('click', 'img', function () {
        var element = this;
        var location = element.id;
        $("#newObstacles").append('<li class="rock" data-behavior="none">' + location + '</li>');
    }).on("contextmenu", 'img', function (e) {
        var element = this;
        var location = element.id;

        openPopup(e, location);
        return false; // Disable default context menu behavior
    });

    $("#addObstacles").click(function () {
        var element = $("#newObstacles");
        var itemsToSend = new Array();
        var callback = function (index, element) {
            var jqElement = $(element);
            itemsToSend[index] = {
                coordinates: jqElement.text(),
                type: jqElement.attr('class'),
                behavior: jqElement.data('behavior')
            };
        };

        iterateListItems(callback, element);
        updateObstaclesOnServer(itemsToSend, obstacleUpdateSuccess, wtf);
    });

    $("input[type='image']").click(function () {
        var element = this;
        var value = element.value;
        var field = $(this).data('field');

        $("#newCommands").append('<li data-field="' + field + '" >' + value + '</li>');
    });

    $("#sendCommands").click(function () {
        var element = $("#newCommands");
        var itemsToSend = new Array();
        var callback = function (index, element) { itemsToSend[index] = $(element).data('field'); };

        iterateListItems(callback, element);
        sendCommandsToServer(itemsToSend, commandUpdateSuccess, wtf);
    });

    $("#alien-tracker").click(function () {
        $("#newObstacles").append('<li class="alien" data-behavior="tracker">' + alienCoordinates + '</li>');
        closePopup();

    });

    $("#alien-wallBuilder").click(function () {
        $("#newObstacles").append('<li class="alien" data-behavior="wallbuilder">' + alienCoordinates + '</li>');
        closePopup();

    });

    $("#alien-shooter").click(function () {
        $("#newObstacles").append('<li class="alien" data-behavior="shooter">' + alienCoordinates + '</li>');
        closePopup();

    });

    function commandUpdateSuccess(result) {
        if (result.success) {
            var locationToUpdate = result.roverLocation;
            var oldRoverLocation = result.previousRoverLocation;
            var roverFacing = result.roverFacing;

            setOldRoverLocationToGround(oldRoverLocation);

            obstacleUpdateSuccess(result);

            $("img[id='" + locationToUpdate + "']").attr('src', '/Images/Rover-' + roverFacing + '.png');

            emptyListElement($("#newCommands"));
        }
        else { alert("Unable to send commands. Did you enter any?"); }
    }

    function obstacleUpdateSuccess(result) {
        if (result.success) {
            $(result.removedObstacles).each(updateMapLocation);
            $(result.obstacles).each(updateMapLocation);
            emptyListElement($("#newObstacles"));
        }
        else { alert("Unable to update obstacles. Did you click on the map to add any?"); }
    }

    function emptyListElement(element) {
        element.empty();
    }

    function setOldRoverLocationToGround(oldLocation) {
        $("img[id='" + oldLocation + "']").attr('src', '/Images/Ground.png');
    }

    function updateMapLocation(index, element) {
        $("img[id='" + element.location + "']").attr('src', '/Images/' + element.image);
    }

    function wtf() {
        alert("Something went wrong with communicating to the server! WTF!");
    }

    function iterateListItems(callback, element) {
        $("li", element).each(function (index, element) {
            callback(index, element);
        });
    }

    function sendCommandsToServer(itemsToSend, callback, wtf) {
        $.ajax({
            type: 'post',
            datatype: 'json',
            url: "../Mission/SendCommands",
            data: JSON.stringify({ commands: itemsToSend }),
            contentType: 'application/json; charset=utf-8',
            cache: false,
            success: callback,
            error: wtf
        });
    }

    function updateObstaclesOnServer(itemsToSend, callback, wtf) {
        $.ajax({
            type: 'post',
            datatype: 'json',
            url: "../Mission/UpdateObstacles",
            data: JSON.stringify(itemsToSend),
            contentType: 'application/json; charset=utf-8',
            cache: false,
            success: callback,
            error: wtf
        });
    }

    function openPopup(e, location) {
        $("#control-popup").css({ "opacity": "0.7" });
        $("#control-popup").css({ "top": e.pageY });
        $("#control-popup").css({ "left": e.pageX });
        $("#control-popup").fadeIn("slow");
        alienCoordinates = location;
    }

    var alienCoordinates;

    function closePopup() {
        $("#control-popup").fadeOut("fast");
    }
}
