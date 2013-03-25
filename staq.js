var staq_events = [];
var staq_loop_started = false;
var authenticating = false;
var authToken = null;
var sid = null;
var uid = null;

function staq_auth(appId, deviceInfo, success) {

    var new_guid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    var data = {
        "deviceId": new_guid(),
        "deviceInfo": deviceInfo
    };

    var url = 'http://api.staq.io/v1/apps/' + appId + '/auth/device';

    $.ajax(
        {
           url: url,
           type:"POST",
           data: JSON.stringify(data),
           contentType: "application/json",
           success: success
        });
}


function staq_enqueue_event(appId, event)
{

    var post = function(uid, authToken, events, success) {

        var url = 'http://api.staq.io/v1/apps/' + appId + '/users/' + uid + '/events';

        $.ajax(
            {
                url: url,
                type:"POST",
                beforeSend: function (request)
                {
                    request.setRequestHeader("Auth-Token", authToken);
                },
                data: JSON.stringify(events),
                contentType: "application/json",
                success: success
            });

    };


    var try_start_loop = function()
    {
        if (!staq_loop_started)
        {
            if (authToken == null || !authenticating)
            {
                authenticating = true;
                staq_auth(appId, {}, function(data){
                    authToken = data['token'];
                    sid = data['sid'];
                    uid = data['uid'];
                });
            }

            staq_loop_started = true;

            var try_post = function()
            {
                if (authToken != null)
                {
                    if (staq_events.length > 0)
                    {
                        var data = {'sid' : sid, 'events' : staq_events};

                        post(uid,authToken,data,function(data){
                        });

                        staq_events = [];
                    }
                }
            };

            setInterval(try_post, 2000);
        }
    };

    try_start_loop(appId);
    staq_events.push(event);

}