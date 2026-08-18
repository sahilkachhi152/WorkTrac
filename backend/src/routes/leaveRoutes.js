const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");


const {
    applyLeave,
    getMyLeaves,
    cancelLeave
} = require("../controllers/leaveController");


const {
    applyLeaveValidator
} = require("../validators/leaveValidator");


const { validationResult } = require("express-validator");


// ===============================
// VALIDATION MIDDLEWARE
// ===============================

const validate = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(400).json({

            errors: errors.array()

        });

    }

    next();

};



// ===============================
// APPLY LEAVE
// ===============================

router.post(

    "/",

    authMiddleware,

    applyLeaveValidator,

    validate,

    applyLeave

);



// ===============================
// MY LEAVES
// ===============================

router.get(

    "/my",

    authMiddleware,

    getMyLeaves

);



// ===============================
// CANCEL PENDING LEAVE
// ===============================

router.delete(

    "/:id",

    authMiddleware,

    cancelLeave

);


module.exports = router;