const express = require("express");

const router = express.Router();

const Person = require("../modules/schema");

const role = { enum: ["Board", "Staff", "Participant"] };

const multer = require("multer");

const fs = require("fs");

const path = require("path");

const ObjectID = require("mongodb").ObjectID;

//? Images upload =============================================================

var Storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname);
    },
});

var upload = multer({ storage: Storage }).single("image");

//? ===========================================================================

//^ Add new board =============================================================

let hbC = 909,
    mtC = 707,
    mmC = 505,
    hrC = 603,
    prC = 450,
    ocC = 101;

function makeBoardUniqueID(committee, rank) {
    let id;
    switch (committee) {
        case "Mentor":
            if (rank == "Project Manager" || rank == "Lecturer") {
                id = `00-${hbC}-06`;
                hbC = hbC + 10;
            } else {
                id = "01-" + mtC + "-03";
                mtC = mtC + 10;
            }
            break;

        case "Media and marketing":
            if (rank == "Head") {
                id = `01-${mmC}-02`;
                mmC = mmC + 10;
            } else {
                id = `01 - ${mmC} -02`;
                mmC = mmC + 10;
            }
            break;
        case "Human resources":
            if (rank == "Head") {
                id = `01-${hrC}-01`;
                hrC = hrC + 17;
            } else {
                id = `01-${hrC}-01`;
                hrC = hrC + 10;
            }
            break;
        case "Public relations":
            if (rank == "Head") {
                id = `01-${prC}-05`;
                prC = prC + 10;
            } else {
                id = `01-${prC}-05`;
                prC = prC + 5;
            }
            break;
        case "Organization":
            if (rank == "Head") {
                id = `01-${ocC}-04`;
                ocC = ocC + 20;
            } else {
                id = `01-${ocC}-04`;
                ocC = ocC + 9;
            }
            break;
        default:
            id = "invalid";
            break;
    }
    return id;
}

function makeBoardTitle(committee, rank) {
    var title;

    if (
        rank == "Coordinator" ||
        rank == "Project Manager" ||
        rank == "Lecturer"
    ) {
        title = rank;
    } else {
        title = rank + " of " + committee;
    }
    return title;
}

router.post("/newBoard", upload, (req, res) => {
    console.log("Posting");
    var img;
    if (req.file) {
        img = req.file.filename;
    } else {
        img = "default.png";
    }
    var board = new Person({
        id: makeBoardUniqueID(req.body.committee, req.body.rank),
        name: req.body.name,
        phone: req.body.phone,
        role: "Board",
        rank: req.body.rank,
        committee: req.body.committee,
        title: makeBoardTitle(req.body.committee, req.body.rank),
        image: img,
        boardScore: {
            sessions: [
                {
                    attendance: 0,
                    flex: 0,
                    communication: 0,
                    problem_solving: 0,
                    leadership: 0,
                    team_follow_up: 0,
                    staff_development: 0,
                    attitude: 0,
                },
            ],

            rate: 0,
        },
        warnings: 0,
        notes: "",
    });
    board
        .save()
        .then((result) => {
            req.session.message = {
                type: "success",
                message: "Board added successfully",
            };
            res.redirect("/board");
        })
        .catch((err) => {
            // res.render("err", { title: "ASCE - Error" });
            res.json({ message: err.message, type: "danger" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        });
});

// async function rateCalculator(sessions) {
//     var total = 0;
//     for (var i = 0; i <= sessions.length; i++) {
//         total += sessions[i].sum;
//     }
//     var rate = (total / (sessions.length * 80)) * 100;

//     return new Promise((resolve, reject) => {
//         resolve(rate);
//     });
// }

function clamp(number, min, max) {
    return Math.max(min, Math.min(number, max));
}

//^ ===========================================================================

//& Get all board =============================================================

router.get("/board", (req, res) => {
    Person.find({ role: "Board" })
        .then((result) => {
            res.status(200);
            res.render("board", { title: "ASCE - Board", data: result });
        })
        .catch((err) => {
            res.render("err", { title: "ASCE - Error" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        });
});

router.get("/view-board/:id", (req, res) => {
    Person.find({ id: req.params.id })
        .then((result) => {
            res.status(200);
            res.render("view-board", {
                title: `ASCE - Board - ${result[0].name}`,
                data: result[0],
            });

            // result[0].boardScore.rate = rateCalculator(
            //     result[0].boardScore.sessions
            // );

            console.log(result[0]);
        })
        .catch((err) => {
            res.render("err", { title: "ASCE - Error" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        });
});

router.get("/view-board-as/:id", (req, res) => {
    Person.find({ id: req.params.id })
        .then((result) => {
            res.status(200);
            res.render("view-board-as", {
                title: `ASCE - Board - ${result[0].name}`,
                data: result[0],
            });

            // result[0].boardScore.rate = rateCalculator(
            //     result[0].boardScore.sessions
            // );

            console.log(result[0]);
        })
        .catch((err) => {
            res.render("err", { title: "ASCE - Error" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        });
});

//& ===========================================================================

//~ Edit board ================================================================

router.get("/edit-board/:id", (req, res) => {
    Person.find({ id: req.params.id })
        .then((result) => {
            res.status(200);
            res.render("edit-board", {
                title: `ASCE - Board - ${result[0].name}`,
                data: result[0],
            });
        })
        .catch((err) => {
            res.render("err", { title: "ASCE - Error" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        });
});

router.post("/edit-board/:id", upload, (req, res) => {
    var img;

    // Person.findOne({ id: req.params.id }).then((result) => {
    //     console.log(req.body.keepImage);
    //     switch (req.body.keepImage) {
    //         case "keep":
    //             img = result.image;
    //             break;

    //         case "delete":
    //             try {
    //                 fs.unlinkSync(`./uploads/${result.image}`);
    //                 img = "default.png";
    //             } catch (err) {
    //                 console.log("eeeeeeeeeeeeerrrrrorrrrrrrr" + err);
    //             }

    //             break;
    //         case "change":
    //             try {
    //                 fs.unlinkSync(`./uploads/${result.image}`);
    //                 img = req.file.filename;
    //             } catch (err) {
    //                 console.log("eeeeeeeeeeeeerrrrrorrrrrrrr" + err);
    //             }
    //             img = req.file.filename;

    //             break;
    //     }
    // });

    Person.find({ id: req.params.id }).then((result) => {
        if (req.file) {
            img = req.file.filename;
        } else {
            try {
                fs.unlinkSync(`./uploads/${result.image}`);
                img = "default.png";
            } catch (err) {
                console.log("eeeeeeeeeeeeerrrrrorrrrrrrr" + err);
            }
            img = "default.png";
        }
    });

    var board = {
        name: req.body.name,
        phone: req.body.phone,
        rank: req.body.rank,
        committee: req.body.committee,
        title: makeBoardTitle(req.body.committee, req.body.rank),
        image: img,
    };
    Person.updateOne({ id: req.params.id }, board).then((result) => {
        req.session.message = {
            type: "success",
            message: "Board edited successfully",
        };
        res.redirect("/board");
    });
});

//~ ===========================================================================

//^ Delete board ==============================================================

router.get("/delete-board/:id", (req, res) => {
    Person.findOneAndDelete({ id: req.params.id }).then((result) => {
        if (result.image != "default.png") {
            try {
                fs.unlinkSync(`./uploads/${result.image}`);
            } catch (err) {
                console.log("eeeeeeeeeeeeerrrrrorrrrrrrr" + err);
            }
        }
        req.session.message = {
            type: "success",
            message: "Board deleted successfully",
        };
        res.redirect("/board");
    });
});

//^============================================================================

//? Add session to the board ==================================================

router.get("/board-session-add/:id", (req, res) => {
    Person.findOne({ id: req.params.id })
        .then((result) => {
            res.status(200);
            var session = {
                attendance: false,
                arrival_time: "10:00 am",
                date: "3/2/2024",
                flex: 0,
                communication: 0,
                proplem_solving: 0,
                leadership: 0,
                team_follow_up: 0,
                staff_development: 0,
                attitude: 0,
                sum: 0,
                notes: "",
                message: "",
            };
            result.boardScore.sessions.push(session);

            result.save();

            Person.updateOne({ id: req.params.id }, result);

            res.render("view-board", {
                title: `ASCE - Board - ${result.name}`,
                data: result,
            });
        })
        .catch((err) => {
            res.render("err", { title: "ASCE - Error" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        });
});

//? ===========================================================================

//! Edit sessions of board ====================================================

router.get("/board-session-edit/:id/:_id/:index", (req, res) => {
    Person.findOne({ id: req.params.id }).then((result) => {
        res.status(200);
        res.render("session-board", {
            title: `ASCE - Board - ${result.name}`,
            data: result,
            session: result.boardScore.sessions[req.params.index],
            index: req.params.index,
        });
    });
});

router.post("/board-session-edit/:id/:_id/:index", (req, res) => {
    Person.findOne({ id: req.params.id }).then((result) => {
        // console.log(result.boardScore.sessions[req.params.index]);
        var sum = 0;
        sum += parseInt(clamp(req.body.commitment, 0, 10)) * 2;
        sum += parseInt(clamp(req.body.flex, 0, 10));
        sum += parseInt(clamp(req.body.communication, 0, 10));
        sum += parseInt(clamp(req.body.proplem_solving, 0, 10));
        sum += parseInt(clamp(req.body.leadership, 0, 10));
        sum += parseInt(clamp(req.body.team_follow_up, 0, 10)) * 1.5;
        sum += parseInt(clamp(req.body.staff_development, 0, 10)) * 1.5;
        sum += parseInt(clamp(req.body.attitude, 0, 10));
        sum += parseInt(clamp(req.body.bonus, 0, 10));

        var session = {
            attendance: req.body.attendance,
            arrival_time: req.body.arrival_time,
            date: req.body.date,
            commitment: clamp(req.body.commitment, 0, 10),
            flex: clamp(req.body.flex, 0, 10),
            communication: clamp(req.body.communication, 0, 10),
            proplem_solving: clamp(req.body.proplem_solving, 0, 10),
            leadership: clamp(req.body.leadership, 0, 10),
            team_follow_up: clamp(req.body.team_follow_up, 0, 10),
            staff_development: clamp(req.body.staff_development, 0, 10),
            attitude: clamp(req.body.attitude, 0, 10),
            bonus: clamp(req.body.bonus, -10, 10),
            sum: sum,
            notes: req.body.notes,
            message: req.body.message,
        };

        console.log(session);

        try {
            result.boardScore.sessions[req.params.index] = session;

            result.save();

            Person.updateOne({ id: req.params.id }, result);

            res.render("view-board", {
                title: `ASCE - Board - ${result.name}`,
                data: result,
            });
        } catch (err) {
            res.render("err", { title: "ASCE - Error" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        }
    });
});

//! ===========================================================================

//~ Delete Session from board =================================================

router.get("/board-session-delete/:id/:_id/:index", (req, res) => {
    Person.findOne({ id: req.params.id }).then((result) => {
        result.boardScore.sessions.splice(req.params.index, 1);

        result.save();

        Person.updateOne({ id: req.params.id }, result);

        res.render("view-board", {
            title: `ASCE - Board - ${result.name}`,
            data: result,
        });
    });
});

//~ =======================================================================================================================================

//* Add staff =================================================================

let mtCS = 700,
    mmCS = 500,
    hrCS = 600,
    prCS = 400,
    ocCS = 100;

function makeUniqueStaffId(committee) {
    let id;
    switch (committee) {
        case "Mentor":
            id = "02-" + mtCS + "-03";
            mtCS = mtCS + 1;

            break;

        case "Media and marketing":
            id = `02-${mmCS}-02`;
            mmCS = mmCS + 1;

            break;
        case "Human resources":
            id = `02-${hrCS}-01`;
            hrCS = hrCS + 1;

            break;
        case "Public relations":
            id = `02-${prCS}-05`;
            prCS = prCS + 1;

            break;
        case "Organization":
            id = `02-${ocCS}-04`;
            ocCS = ocCS + 1;

            break;
        default:
            id = "invalid";
            break;
    }
    return id;
}

router.post("/newStaff", upload, (req, res) => {
    var img;
    if (req.file) {
        img = req.file.filename;
    } else {
        img = "default.png";
    }
    var staff = new Person({
        id: makeUniqueStaffId(req.body.committee),
        name: req.body.name,
        phone: req.body.phone,
        role: "Staff",
        rank: req.body.rank,
        committee: req.body.committee,
        title: req.body.committee,
        image: img,
        staffScore: {
            sessions: [
                {
                    attendance: 0,
                    arrival_time: "10:00",
                    date: "3/2/2024",
                    commitment: 0,
                    flex: 0,
                    task: 0,
                    active: 0,
                    applying: 0,
                    self_development: 0,
                    attitude: 0,
                    bonus: 0,
                    sum: 0,
                    notes: "",
                    message: "",
                },
            ],
        },
    });
    staff
        .save()
        .then((result) => {
            req.session.message = {
                type: "success",
                message: "Staff added successfully",
            };
            res.redirect("/staff");
        })
        .catch((err) => {
            res.json({ message: err.message, type: "danger" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        });
});

//* ===========================================================================

//? Staff view ================================================================

router.get("/staff", (req, res) => {
    Person.find({ role: "Staff" })
        .then((result) => {
            res.status(200);
            res.render("staff", { title: "ASCE - staff", data: result });
        })
        .catch((err) => {
            res.render("err", { title: "ASCE - Error" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        });
});

router.get("/staff-profile-mode", (req, res) => {
    Person.find({ role: "Staff" })
        .then((result) => {
            res.status(200);
            res.render("staff-profile-mode", {
                title: "ASCE - Staff",
                data: result,
            });
        })
        .catch((err) => {
            res.render("err", { title: "ASCE - Error" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        });
});

router.get("/view-staff/:id", (req, res) => {
    Person.find({ id: req.params.id })
        .then((result) => {
            res.status(200);
            res.render("view-staff", {
                title: `ASCE - Staff - ${result[0].name}`,
                data: result[0],
            });
        })
        .catch((err) => {
            res.render("err", { title: "ASCE - Error" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        });
});

router.get("/view-staff-as/:id", (req, res) => {
    Person.find({ id: req.params.id })
        .then((result) => {
            res.status(200);
            res.render("view-staff-as", {
                title: `ASCE - Staff - ${result[0].name}`,
                data: result[0],
            });
        })
        .catch((err) => {
            res.render("err", { title: "ASCE - Error" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        });
});

//? ===========================================================================

//^ Delete staff ==============================================================

router.get("/delete-staff/:id", (req, res) => {
    Person.findOneAndDelete({ id: req.params.id }).then((result) => {
        if (result.image != "default.png") {
            try {
                fs.unlinkSync(`./uploads/${result.image}`);
            } catch (err) {
                console.log("eeeeeeeeeeeeerrrrrorrrrrrrr" + err);
            }
        }
        req.session.message = {
            type: "success",
            message: "Staff deleted successfully",
        };
        res.redirect("/staff");
    });
});

//^ ===========================================================================

//~ Edit staff ================================================================

router.get("/edit-staff/:id", (req, res) => {
    Person.find({ id: req.params.id })
        .then((result) => {
            res.status(200);
            res.render("edit-staff", {
                title: `ASCE - Staff - ${result[0].name}`,
                data: result[0],
            });
        })
        .catch((err) => {
            res.render("err", { title: "ASCE - Error" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        });
});

router.post("/edit-staff/:id", upload, (req, res) => {
    var img;

    // Person.findOne({ id: req.params.id }).then((result) => {
    //     console.log(req.body.keepImage);
    //     switch (req.body.keepImage) {
    //         case "keep":
    //             img = result.image;
    //             break;

    //         case "delete":
    //             try {
    //                 fs.unlinkSync(`./uploads/${result.image}`);
    //                 img = "default.png";
    //             } catch (err) {
    //                 console.log("eeeeeeeeeeeeerrrrrorrrrrrrr" + err);
    //             }

    //             break;
    //         case "change":
    //             try {
    //                 fs.unlinkSync(`./uploads/${result.image}`);
    //                 img = req.file.filename;
    //             } catch (err) {
    //                 console.log("eeeeeeeeeeeeerrrrrorrrrrrrr" + err);
    //             }
    //             img = req.file.filename;

    //             break;
    //     }
    // });

    Person.find({ id: req.params.id }).then((result) => {
        if (req.file) {
            img = req.file.filename;
        } else {
            try {
                fs.unlinkSync(`./uploads/${result.image}`);
                img = "default.png";
            } catch (err) {
                console.log("eeeeeeeeeeeeerrrrrorrrrrrrr" + err);
            }
            img = "default.png";
        }
    });

    var staff = {
        name: req.body.name,
        phone: req.body.phone,
        rank: req.body.rank,
        committee: req.body.committee,
        title: makeBoardTitle(req.body.committee, req.body.rank),
        image: img,
    };
    Person.updateOne({ id: req.params.id }, staff).then((result) => {
        req.session.message = {
            type: "success",
            message: "Staff edited successfully",
        };
        res.redirect("/staff");
    });
});

//~ ===========================================================================

//* Add session to staff ======================================================

router.get("/staff-session-add/:id", (req, res) => {
    Person.findOne({ id: req.params.id })
        .then((result) => {
            res.status(200);
            var session = {
                attendance: 0,
                arrival_time: "10:00",
                date: "3/2/2024",
                commitment: 0,
                flex: 0,
                task: 0,
                active: 0,
                applying: 0,
                self_development: 0,
                attitude: 0,
                bonus: 0,
                sum: 0,
                notes: "",
                message: "",
            };
            result.staffScore.sessions.push(session);

            result.save();

            Person.updateOne({ id: req.params.id }, result);

            res.render("view-staff", {
                title: `ASCE - Staff - ${result.name}`,
                data: result,
            });
        })
        .catch((err) => {
            res.render("err", { title: "ASCE - Error" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        });
});

//* ===========================================================================

//? Delete session from staff =================================================

router.get("/staff-session-delete/:id/:_id/:index", (req, res) => {
    Person.findOne({ id: req.params.id }).then((result) => {
        result.staffScore.sessions.splice(req.params.index, 1);

        result.save();

        Person.updateOne({ id: req.params.id }, result);

        res.render("view-staff", {
            title: `ASCE - staff - ${result.name}`,
            data: result,
        });
    });
});

//? ===========================================================================

//& Edit session of staff =====================================================

router.get("/staff-session-edit/:id/:_id/:index", (req, res) => {
    Person.findOne({ id: req.params.id }).then((result) => {
        res.status(200);
        res.render("session-staff", {
            title: `ASCE - Staff - ${result.name}`,
            data: result,
            session: result.staffScore.sessions[req.params.index],
            index: req.params.index,
        });
    });
});

router.post("/staff-session-edit/:id/:_id/:index", (req, res) => {
    Person.findOne({ id: req.params.id }).then((result) => {
        // console.log(result.boardScore.sessions[req.params.index]);
        var sum = 0;
        sum += parseInt(clamp(req.body.commitment, 0, 10)) * 2;
        sum += parseInt(clamp(req.body.flex, 0, 10));
        sum += parseInt(clamp(req.body.attitude, 0, 10));
        sum += parseInt(clamp(req.body.task, 0, 10)) * 1.5;
        sum += parseInt(clamp(req.body.self_development, 0, 10)) * 2;
        sum += parseInt(clamp(req.body.active, 0, 10));
        sum += parseInt(clamp(req.body.applying, 0, 10)) * 1.5;
        sum += parseInt(clamp(req.body.bonus, 0, 10));

        var session = {
            attendance: req.body.attendance,
            arrival_time: req.body.arrival_time,
            date: req.body.date,
            commitment: clamp(req.body.commitment, 0, 10),
            flex: clamp(req.body.flex, 0, 10),
            attitude: clamp(req.body.attitude, 0, 10),
            task: clamp(req.body.task, 0, 10),
            self_development: clamp(req.body.self_development, 0, 10),
            active: clamp(req.body.active, 0, 10),
            applying: clamp(req.body.applying, 0, 10),
            bonus: clamp(req.body.bonus, -10, 10),
            sum: sum,
            notes: req.body.notes,
            message: req.body.message,
        };

        console.log(session);

        try {
            result.staffScore.sessions[req.params.index] = session;

            result.save();

            Person.updateOne({ id: req.params.id }, result);

            res.render("view-staff", {
                title: `ASCE - Staff - ${result.name}`,
                data: result,
            });
        } catch (err) {
            res.render("err", { title: "ASCE - Error" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        }
    });
});

//& ===========================================================================

//? Add participant ===========================================================

let ptC = 1700;

function makeUniquePartID(team) {
    let id;
    id = `03-${ptC}-${team}`;
    ptC = ptC + 1;
    return id;
}

router.post("/newPart", upload, (req, res) => {
    var img;
    if (req.file) {
        img = req.file.filename;
    } else {
        img = "default.png";
    }
    var part = new Person({
        id: makeUniquePartID(req.body.team),
        name: req.body.name,
        phone: req.body.phone,
        role: "Part",
        team: req.body.team,
        image: img,
        partScore: {
            sessions: [
                {
                    attendance: 0,
                    arrival_time: "10:00",
                    date: "3/2/2024",
                    commitment: 0,
                    flex: 0,
                    attitude: 0,
                    active: 0,
                    self_development: 0,
                    applying: 0,
                    bonus: 0,
                    sum: 0,
                    notes: "",
                    message: "",
                },
            ],
            warnings: 0,
            rate: 0,
        },
    });
    part.save()
        .then((result) => {
            req.session.message = {
                type: "success",
                message: "Participant added successfully",
            };
            res.redirect("/part");
        })
        .catch((err) => {
            res.json({ message: err.message, type: "danger" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        });
});

//? ===========================================================================

//& View participants =========================================================

router.get("/part", (req, res) => {
    Person.find({ role: "Part" })
        .then((result) => {
            res.status(200);
            res.render("part", { title: "ASCE - participant", data: result });
        })
        .catch((err) => {
            res.render("err", { title: "ASCE - Error" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        });
});

router.get("/part-profile-mode", (req, res) => {
    Person.find({ role: "Part" })
        .then((result) => {
            res.status(200);
            res.render("part-profile-mode", {
                title: "ASCE - part",
                data: result,
            });
        })
        .catch((err) => {
            res.render("err", { title: "ASCE - Error" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        });
});

router.get("/view-part/:id", (req, res) => {
    Person.find({ id: req.params.id })
        .then((result) => {
            res.status(200);
            res.render("view-part", {
                title: `ASCE - Participant - ${result[0].name}`,
                data: result[0],
            });
        })
        .catch((err) => {
            res.render("err", { title: "ASCE - Error" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        });
});

router.get("/view-part-as/:id", (req, res) => {
    Person.find({ id: req.params.id })
        .then((result) => {
            res.status(200);
            res.render("view-part-as", {
                title: `ASCE - Participant - ${result[0].name}`,
                data: result[0],
            });
        })
        .catch((err) => {
            res.render("err", { title: "ASCE - Error" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        });
});

//& ===========================================================================

//^ Delete participant ========================================================

router.get("/delete-part/:id", (req, res) => {
    Person.findOneAndDelete({ id: req.params.id }).then((result) => {
        if (result.image != "default.png") {
            try {
                fs.unlinkSync(`./uploads/${result.image}`);
            } catch (err) {
                console.log("eeeeeeeeeeeeerrrrrorrrrrrrr" + err);
            }
        }
        req.session.message = {
            type: "success",
            message: "Participant deleted successfully",
        };
        res.redirect("/part");
    });
});

//^ ===========================================================================

//? Edit participant ==========================================================

router.get("/edit-part/:id", (req, res) => {
    Person.find({ id: req.params.id })
        .then((result) => {
            res.status(200);
            res.render("edit-part", {
                title: `ASCE - Participant - ${result[0].name}`,
                data: result[0],
            });
        })
        .catch((err) => {
            res.render("err", { title: "ASCE - Error" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        });
});

router.post("/edit-part/:id", upload, (req, res) => {
    var img;

    // Person.findOne({ id: req.params.id }).then((result) => {
    //     console.log(req.body.keepImage);
    //     switch (req.body.keepImage) {
    //         case "keep":
    //             img = result.image;
    //             break;

    //         case "delete":
    //             try {
    //                 fs.unlinkSync(`./uploads/${result.image}`);
    //                 img = "default.png";
    //             } catch (err) {
    //                 console.log("eeeeeeeeeeeeerrrrrorrrrrrrr" + err);
    //             }

    //             break;
    //         case "change":
    //             try {
    //                 fs.unlinkSync(`./uploads/${result.image}`);
    //                 img = req.file.filename;
    //             } catch (err) {
    //                 console.log("eeeeeeeeeeeeerrrrrorrrrrrrr" + err);
    //             }
    //             img = req.file.filename;

    //             break;
    //     }
    // });

    Person.find({ id: req.params.id }).then((result) => {
        if (req.file) {
            img = req.file.filename;
        } else {
            try {
                fs.unlinkSync(`./uploads/${result.image}`);
                img = "default.png";
            } catch (err) {
                console.log("eeeeeeeeeeeeerrrrrorrrrrrrr" + err);
            }
            img = "default.png";
        }
    });

    var part = {
        name: req.body.name,
        phone: req.body.phone,
        team: req.body.team,
        image: img,
    };
    Person.updateOne({ id: req.params.id }, part).then((result) => {
        req.session.message = {
            type: "success",
            message: "Participant edited successfully",
        };
        res.redirect("/part");
    });
});

//? ===========================================================================

//* Add session to participant ================================================

router.get("/part-session-add/:id", (req, res) => {
    Person.findOne({ id: req.params.id })
        .then((result) => {
            res.status(200);
            var session = {
                attendance: 0,
                arrival_time: "10:00",
                date: "3/2/2024",
                commitment: 0,
                flex: 0,
                attitude: 0,
                active: 0,
                self_development: 0,
                applying: 0,
                bonus: 0,
                sum: 0,
                notes: "",
                message: "",
            };
            result.partScore.sessions.push(session);

            result.save();

            Person.updateOne({ id: req.params.id }, result);

            res.render("view-part", {
                title: `ASCE - Participant - ${result.name}`,
                data: result,
            });
        })
        .catch((err) => {
            res.render("err", { title: "ASCE - Error" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        });
});

//* ===========================================================================

//? Delete session from participant ==========================================

router.get("/part-session-delete/:id/:_id/:index", (req, res) => {
    Person.findOne({ id: req.params.id }).then((result) => {
        result.partScore.sessions.splice(req.params.index, 1);

        result.save();

        Person.updateOne({ id: req.params.id }, result);

        res.render("view-part", {
            title: `ASCE - Participant - ${result.name}`,
            data: result,
        });
    });
});

//? ===========================================================================

//& Edit session of participant =====================================================

router.get("/part-session-edit/:id/:_id/:index", (req, res) => {
    Person.findOne({ id: req.params.id }).then((result) => {
        res.status(200);
        res.render("session-part", {
            title: `ASCE - Participant - ${result.name}`,
            data: result,
            session: result.partScore.sessions[req.params.index],
            index: req.params.index,
        });
    });
});

router.post("/part-session-edit/:id/:_id/:index", (req, res) => {
    Person.findOne({ id: req.params.id }).then((result) => {
        // console.log(result.boardScore.sessions[req.params.index]);
        var sum = 0;
        sum += parseInt(clamp(req.body.commitment, 0, 10)) * 2;
        sum += parseInt(clamp(req.body.flex, 0, 10));
        sum += parseInt(clamp(req.body.attitude, 0, 10)) * 1.5;
        sum += parseInt(clamp(req.body.self_development, 0, 10)) * 2;
        sum += parseInt(clamp(req.body.active, 0, 10)) * 1.5;
        sum += parseInt(clamp(req.body.applying, 0, 10)) * 2;
        sum += parseInt(clamp(req.body.bonus, 0, 10));

        var session = {
            attendance: req.body.attendance,
            arrival_time: req.body.arrival_time,
            date: req.body.date,
            commitment: clamp(req.body.commitment, 0, 10),
            flex: clamp(req.body.flex, 0, 10),
            attitude: clamp(req.body.attitude, 0, 10),
            self_development: clamp(req.body.self_development, 0, 10),
            active: clamp(req.body.active, 0, 10),
            applying: clamp(req.body.applying, 0, 10),
            bonus: clamp(req.body.bonus, -10, 10),
            sum: sum,
            notes: req.body.notes,
            message: req.body.message,
        };

        try {
            result.partScore.sessions[req.params.index] = session;

            result.save();

            Person.updateOne({ id: req.params.id }, result);

            res.render("view-part", {
                title: `ASCE - Participant. - ${result.name}`,
                data: result,
            });
        } catch (err) {
            res.render("err", { title: "ASCE - Error" });
            console.log("ERRRRRRRRRRRRRRRRRORRRRRRRRRRR" + err);
        }
    });
});

//& ===========================================================================

//! Basic router ==============================================================

router.get("/home", (req, res) => {
    res.render("index", { title: "ASCE - Home" });
});

router.get("/", (req, res) => {
    res.render("index", { title: "ASCE - Home" });
});

router.get("/board", (req, res) => {
    res.render("board", { title: "ASCE - Board" });
});

router.get("/staff", (req, res) => {
    res.render("staff", { title: "ASCE - Staff" });
});

router.get("/part", (req, res) => {
    res.render("part", { title: "ASCE - Participants" });
});

router.get("/board-add", (req, res) => {
    res.render("board-add", { title: "ASCE - Add board" });
});

router.get("/staff-add", (req, res) => {
    res.render("staff-add", { title: "ASCE - Add staff" });
});

router.get("/part-add", (req, res) => {
    res.render("part-add", { title: "ASCE - Add participant" });
});

router.get("*", (req, res) => {
    res.render("err", { title: "ASCE - Error" });
});

//! ==========================================================================

module.exports = router;
