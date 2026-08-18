const superiorMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "superior") {
        return res.status(403).json({
            message: "Superior Admin access required"
        });
    }
    next();
};

module.exports = superiorMiddleware;