const {ActivityRecorder} = require("../models/activityRecorderModel");

let activity = (req, res, next) => {
    if (req.action) {
        let act = new ActivityRecorder(
            {
                user: req.user._id,
                unlinkedUserName: req.user.firstname+" "+req.user.surname,
                unlinkedUserEmail: req.user.email,
                action: req.action,
                time: Date.now(),
            }
        )
        act.save((err, doc) => {
            console.log("Activity log: ", req.user.nickname, " -> ", req.action)
        });
    }

};

module.exports = {activity};
