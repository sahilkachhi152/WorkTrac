const adminOrSuperiorMiddleware = (req, res, next) => {
    // Check if user exists in the request (set by authMiddleware)
    if (!req.user) {
        return res.status(401).json({ 
            message: "Authentication required" 
        });
    }

    // LOG THE ROLE FOR DEBUGGING (optional, remove later)
    console.log("User Role:", req.user.role);

    // Allow both 'admin' and 'superior' roles
    if (req.user.role === "admin" || req.user.role === "superior") {
        return next();
    }

    // If not admin or superior, block access
    return res.status(403).json({
        message: "Admin access required"
    });
};

module.exports = adminOrSuperiorMiddleware;